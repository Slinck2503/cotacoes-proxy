import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const url = 'https://ctrcambio.com.br/tvcaxias'; // URL do site de cotações
    const response = await fetch(url);
    const text = await response.text();

    console.log('Conteúdo recebido do site:', text.slice(0, 500)); // só os 500 primeiros caracteres para não lotar o log

    // Aqui você precisa fazer parsing do texto recebido para extrair as cotações
    // Exemplo simples, adaptável:
    const cotacoes = {};

    // Supondo que o site tenha o HTML como tabela, você poderia usar regex simples
    const regex = /<tr>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<\/tr>/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const moeda = match[1].trim();
      const compra = parseFloat(match[2].replace(',', '.'));
      const venda = parseFloat(match[3].replace(',', '.'));
      cotacoes[moeda] = { compra, venda };
    }

    res.status(200).json({ success: true, cotacoes });
  } catch (err) {
    console.error('Erro ao buscar cotações:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
