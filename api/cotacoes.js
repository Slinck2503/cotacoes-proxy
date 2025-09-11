import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const url = 'http://ctrcambio.com.br/tvcaxias/';
    const response = await fetch(url);
    const html = await response.text();

    console.log('Trecho do HTML recebido: ', html.substring(0, 500)); // apenas os primeiros 500 caracteres

    const $ = cheerio.load(html);

    const cotacoes = {};

    // Seleciona os blocos de cada moeda pelo texto encontrado
    $('td').each((i, elem) => {
      const text = $(elem).text().trim();

      // Detecta nomes das moedas
      if (
        [
          'Dólar Americano', 'Euro', 'Libra Esterlina', 'Dólar Australiano',
          'Peso Argentino', 'Dólar Neozelandês', 'Dólar Canadense',
          'Franco Suiço', 'Peso Uruguaio', 'Peso Chileno',
          'Peso Mexicano', 'Peso Colombiano', 'Iuan Chinês',
          'Iene Japonês', 'Novo Sol Peruano', 'Rand Africano'
        ].includes(text)
      ) {
        const compra = $(elem).next().text().trim().replace(/\s+/g, '');
        const venda = $(elem).next().next().text().trim().replace(/\s+/g, '');
        cotacoes[text] = { compra, venda };
        console.log('Linha encontrada:', text);
      }
    });

    res.status(200).json({ success: true, cotacoes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
