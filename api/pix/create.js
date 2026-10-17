const API_BASE = 'https://nexuspag.com';
const PLANS = { month: { amount: 19.90, label: 'Assinatura Lurdes Souza - 1 mês' }, quarter: { amount: 34.90, label: 'Assinatura Lurdes Souza - 3 meses' }, halfyear: { amount: 58.84, label: 'Assinatura Lurdes Souza - 6 meses' } };
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const key = process.env.ATENASPAY_API_KEY;
  if (!key) return res.status(500).json({ error: 'Configure ATENASPAY_API_KEY nas variáveis de ambiente da Vercel.' });
  const plan = PLANS[req.body?.plan];
  if (!plan) return res.status(400).json({ error: 'Plano inválido.' });
  const baseUrl = (process.env.APP_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')).replace(/\/$/, '');
  const externalId = `lurdes_${req.body.plan}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    const upstream = await fetch(`${API_BASE}/api/pix/create`, { method: 'POST', headers: { 'x-api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ amount: plan.amount, description: plan.label, external_id: externalId, expiration: 1800, ...(baseUrl ? { webhook_url: `${baseUrl}/api/webhooks/atenaspay` } : {}) }) });
    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok || result.success === false) return res.status(upstream.status || 502).json({ error: result.message || result.error || 'A AtenasPay recusou a cobrança Pix.' });
    const tx = result.transaction || result.data?.transaction || result.data || result;
    const identifier = String(tx.id || tx.txid || tx.external_id || externalId);
    const pixCode = String(tx.pix_copia_cola || tx.pix_copy_paste || tx.pix_code || '');
    let pixImage = String(tx.qr_code_base64 || '');
    if (pixImage && !pixImage.startsWith('data:') && !pixImage.startsWith('http')) pixImage = `data:image/png;base64,${pixImage}`;
    if (!pixCode) return res.status(502).json({ error: 'AtenasPay não retornou o código Pix copia e cola.' });
    return res.status(200).json({ identifier, pix_code: pixCode, pix_image: pixImage });
  } catch { return res.status(502).json({ error: 'Falha ao conectar à AtenasPay.' }); }
};
