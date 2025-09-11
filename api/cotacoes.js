import fetch from 'node-fetch';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    // Buscar o HTML da página de cotações
    const response = await fetch('http://ctrcambio.com.br/tvcaxias/');
    const html = await response.text();

    // Carregar HTML no Cheerio
    const $ = cheerio.load(html);

    // Objeto para armazenar cotações
    const cotacoes = {};

    // Exemplo: pegar todas as linhas da tabela de moedas
    $('table tr').each((i, row) => {
      const cols = $(row).find('td');
      if (cols.length >= 3) {
        const moeda = $(cols[0]).text().trim();
        const compra = $(cols[1]).text().trim();
        const venda = $(cols[2]).text().trim();

        if (moeda) {
          cotacoes[moeda] = {
            compra: parseFloat(compra.replace(',', '.')),
            venda: parseFloat(venda.replace(',', '.'))
          };
        }
      }
    });

    return res.status(200).json({ success: true, cotacoes });
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
