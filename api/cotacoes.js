import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const response = await fetch("http://ctrcambio.com.br/tvcaxias/");
    const html = await response.text();

    // Carregar o HTML com cheerio
    const $ = cheerio.load(html);

    // Objeto para armazenar as cotações
    const cotacoes = {};

    // Exemplo: supondo que a tabela tenha linhas <tr> com moeda e valor
    $("table tr").each((i, el) => {
      const moeda = $(el).find("td").eq(0).text().trim();
      const valor = $(el).find("td").eq(1).text().trim();

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
