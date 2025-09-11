import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const response = await fetch("http://ctrcambio.com.br/tvcaxias/");
    const html = await response.text();

    // DEBUG: imprimir parte do HTML recebido
    console.log("Trecho do HTML recebido:", html.substring(0, 1000));

    const $ = cheerio.load(html);

    const cotacoes = {};

    // DEBUG: listar todos os <tr> encontrados
    $("tr").each((i, el) => {
      console.log("Linha encontrada:", $(el).text().trim());
    });

    // TENTATIVA: pegar tabela
    $("table tr").each((i, el) => {
      const tds = $(el).find("td");
      const moeda = tds.eq(0).text().trim();
      const valor = tds.eq(1).text().trim();

      if (moeda && valor) {
        cotacoes[moeda] = valor;
      }
    });

    res.status(200).json({ success: true, cotacoes });
  } catch (err) {
    console.error("Erro ao buscar cotações:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
