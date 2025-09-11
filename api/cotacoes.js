import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    // URL da página que vamos fazer scraping
    const url = 'http://ctrcambio.com.br/tvcaxias/';
    const response = await fetch(url);
    const html = await response.text();

    console.log('Trecho do HTML recebido: \n', html.slice(0, 500)); // só os primeiros 500 caracteres

    const $ = cheerio.load(html);

    const cotacoes = {};

    // Procurar as linhas com moedas e valores
    $('tr').each((i, elem) => {
      const cols = $(elem).find('td');
      if (cols.length >= 3) {
        const moeda = $(cols[0]).text().trim();
        const compra = $(cols[1]).text().trim();
        const venda = $(cols[2]).text().trim();

        if (moeda && compra && venda) {
          cotacoes[moeda] = { compra, venda };
          console.log('Linha encontrada:', moeda, compra, venda);
        }
      }
    });

    res.status(200).json({ success: true, cotacoes });
  } catch (error) {
    console.error('Erro no scraping:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
