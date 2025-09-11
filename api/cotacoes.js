import fetch from 'node-fetch';
import { load } from 'cheerio';

export default async function handler(req, res) {
  try {
    // Faz o fetch da página
    const response = await fetch('http://ctrcambio.com.br/tvcaxias/');
    const html = await response.text();

    // Carrega o HTML no Cheerio
    const $ = load(html);

    const cotacoes = {};

    // Seleciona cada linha da tabela de cotações
    $('table tbody tr').each((i, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 3) {
        const moeda = $(tds[0]).text().trim();
        const compra = $(tds[1]).text().trim();
        const venda = $(tds[2]).text().trim();
        if (moeda) {
          cotacoes[moeda] = { compra, venda };
        }
      }
    });

    res.status(200).json({ success: true, cotacoes });
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar cotações' });
  }
}
