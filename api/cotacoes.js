// api/cotacoes.js
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const SOURCE = 'http://ctrcambio.com.br/tvcaxias/';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

async function fetchWithRetry(url, opts = {}, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), opts.timeout || 10000);
      const r = await fetch(url, {
        ...opts,
        signal: controller.signal,
        // prevent node-fetch from compressing twice; leave Accept-Encoding default or omit
      });
      clearTimeout(timeout);
      if (!r.ok) throw new Error('Status ' + r.status);
      return await r.text();
    } catch (err) {
      console.warn(`[fetchWithRetry] attempt ${i+1} failed:`, err.message || err);
      if (i === tries - 1) throw err;
      await new Promise(s => setTimeout(s, 500 * (i+1))); // backoff
    }
  }
}

export default async function handler(req, res) {
  try {
    // Caching basic: allow caller to request fresh with ?nocache=1
    const cacheTtl = 60; // segs - ajuste conforme necessidade
    const now = Date.now();

    // Try fetch with browser-like headers
    const html = await fetchWithRetry(SOURCE, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000
    }, 3);

    // debug small snippet in logs (useful in Vercel logs)
    console.log('[cot] snippet:', html.slice(0,1000));

    const $ = cheerio.load(html);

    const cotacoes = {};

    // Strategy: find table that has header with MOEDA / COMPRA / VENDA
    let found = false;
    $('table').each((ti, table) => {
      if (found) return;
      const headerText = $(table).find('tr').first().text().toLowerCase();
      if (headerText.includes('moeda') && headerText.includes('compra') && headerText.includes('venda')) {
        // it's the table we want
        $(table).find('tr').slice(1).each((ri, tr) => {
          const tds = $(tr).find('td');
          if (tds.length >= 3) {
            const moeda = $(tds[0]).text().trim();
            const compra = $(tds[1]).text().trim().replace(/\s+/g, ' ');
            const venda = $(tds[2]).text().trim().replace(/\s+/g, ' ');
            if (moeda) {
              cotacoes[moeda] = { compra, venda };
            }
          }
        });
        found = true;
      }
    });

    // fallback: search all trs if specific table not found
    if (!found) {
      $('tr').each((i, tr) => {
        const tds = $(tr).find('td');
        if (tds.length >= 3) {
          const moeda = $(tds[0]).text().trim();
          const compra = $(tds[1]).text().trim().replace(/\s+/g, ' ');
          const venda = $(tds[2]).text().trim().replace(/\s+/g, ' ');
          if (moeda) cotacoes[moeda] = { compra, venda };
        }
      });
    }

    console.log('[cot] total found:', Object.keys(cotacoes).length);

    return res.status(200).json({ success: true, cotacoes });

  } catch (err) {
    console.error('[cot] erro final:', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, error: String(err) });
  }
}
