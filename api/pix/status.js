module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const key = process.env.ATENASPAY_API_KEY;
  const id = String(req.query.identifier || '').trim();
  if (!key) return res.status(500).json({ error: 'Configure ATENASPAY_API_KEY na Vercel.' });
  if (!id || id.length > 200) return res.status(400).json({ error: 'Identificador inválido.' });
  try {
    const r = await fetch(`https://nexuspag.com/api/pix/${encodeURIComponent(id)}`, { headers: { 'x-api-key': key, Accept: 'application/json' } });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: d.message || d.error || 'Não foi possível consultar o pagamento.' });
    const tx = d.transaction || d.data?.transaction || d.data || d;
    const raw = String(tx.status || d.status || 'pending').toLowerCase();
    const status = ['paid','completed','confirmed','approved'].includes(raw) ? 'paid' : ['expired','cancelled','canceled','failed','refunded'].includes(raw) ? 'failed' : 'pending';
    return res.status(200).json({ payment: { id: tx.id || tx.txid || id, status, provider_status: raw } });
  } catch { return res.status(502).json({ error: 'Não foi possível consultar a AtenasPay.' }); }
};
