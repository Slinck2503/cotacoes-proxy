// api/cotacoes.js
import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const response = await fetch("http://ctrcambio.com.br/tvcaxias/");
    const html = await response.text();

    // DEBUG: imprimir um trecho maior do HTML recebido
    console.log("Trecho do HTML recebido:", html.substring(0, 5000));

    // Carregar no cheerio
    const $ = cheerio.load(html);

    // DEBUG: listar todas as linhas de tabela encontradas
    $("tr").each((i, el) => {
      console.log("Linha encontrada:", $(el).text().trim());
    });

    // Por enquanto não vamos tentar montar o JSON final,
    // só retornar que o scraping rodou
    res.status(200).json({ success: true, message: "Scraping executado, veja os logs no Vercel." });

  } catch (err) {
    console.error("Erro ao buscar ou processar HTML:", err);
    res.status(500).json({ success: false, error: err.toString() });
  }
}
