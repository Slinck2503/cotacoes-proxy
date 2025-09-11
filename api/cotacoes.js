import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const url = 'http://ctrcambio.com.br/tvcaxias/';
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    // Objeto final que vamos retornar
    const cotacoes = {};

    // Seleciona as linhas que contêm as moedas
    $('table tr').each((i, elem) => {
      const tds = $(elem).find('td').map((i, el) => $(el).text().trim()).get();

      if (tds.length === 3) {
        const moeda = tds[0];
        const compra = tds[1].replace(/\s/g, '');
        const venda = tds[2].replace(/\s/g, '');
        cotacoes[moeda] = { compra, venda };
      }
    });

    res.status(200).json({ success: true, cotacoes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
