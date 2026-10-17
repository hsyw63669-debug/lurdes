# Lurdes Souza — site de assinaturas

Projeto estático pronto para deploy na Vercel, com endpoints serverless para criar e consultar cobranças Pix pela integração AtenasPay.

## Publicação
1. Extraia o ZIP e importe a pasta/projeto no GitHub ou na Vercel.
2. Em Vercel > Settings > Environment Variables, configure `ATENASPAY_API_KEY` com sua chave secreta.
3. Configure `APP_BASE_URL` com a URL pública do projeto.
4. Faça deploy e teste cada plano com uma cobrança de baixo valor.

## Planos fixos no servidor
- `month`: R$ 19,90
- `quarter`: R$ 34,90
- `halfyear`: R$ 58,84

O servidor ignora valores enviados pelo navegador e escolhe o valor pelo identificador do plano. O link do Telegram só é mostrado depois que o endpoint de status retorna pagamento aprovado.

**Importante:** confirme no painel/documentação da AtenasPay o endpoint e o formato da resposta antes de colocar em produção. A chave da API nunca deve ser colocada no HTML nem em variáveis `VITE_*`. Teste o fluxo em ambiente controlado antes de anunciar o site.
