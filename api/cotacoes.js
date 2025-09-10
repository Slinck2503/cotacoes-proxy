// api/cotacoes.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const fonteURL = 'https://ctrcambio.com.br/tvcaxias';

  try {
    // fetch via AllOrigins para contornar CORS
    const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(fonteURL)}`;
    const response = await fetch(proxyURL);
    if (!response.ok) throw new Error(`Erro no proxy: ${response.status}`);

    const data = await response.json();
    const html = data.contents;

    // parse HTML para extrair tabela
    const cotacoes = {};
    const regexLinha = /<tr>(.*?)<\/tr>/g;
    let matchLinha;

    while ((matchLinha = regexLinha.exec(html)) !== null) {
      const linha = matchLinha[1];
      const celulas = linha.match(/<td.*?>(.*?)<\/td>/g);
      if (!celulas || celulas.length < 4) continue;

      const moeda = celulas[1].replace(/<.*?>/g, '').trim();
      const compra = parseFloat(celulas[2].replace(/R\$|\.|,/g, '').replace(/(\d+)$/,'$1')) / 100;
      const venda = parseFloat(celulas[3].replace(/R\$|\.|,/g, '').replace(/(\d+)$/,'$1')) / 100;

      if (moeda && !isNaN(compra) && !isNaN(venda)) {
        cotacoes[moeda] = { compra, venda };
      }
    }

    res.status(200).json({ success: true, cotacoes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
