export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });

  const list = symbols.split(',').slice(0, 20);

  const SYMBOL_MAP = {
    '2330':'2330.TW','2454':'2454.TW','0050':'0050.TW','00646':'00646.TW',
    '0052':'0052.TW','00878':'00878.TW','00981A':'00981A.TW','00988A':'00988A.TW',
    '2317':'2317.TW','2324':'2324.TW','2382':'2382.TW','2383':'2383.TW',
    '2449':'2449.TW','6117':'6117.TW','6127':'6127.TWO','8039':'8039.TW',
    '2367':'2367.TW','3189':'3189.TW','2409':'2409.TW','1711':'1711.TW'
  };

  const results = {};

  await Promise.all(list.map(async (code) => {
    const symbol = SYMBOL_MAP[code] || (code + '.TW');
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=60d`;
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) throw new Error('fetch failed');
      const data = await r.json();
      const result = data?.chart?.result?.[0];
      if (!result) throw new Error('no result');

      const meta = result.meta;
      const price = meta.regularMarketPrice || meta.previousClose || 0;
      const closes = result.indicators?.quote?.[0]?.close?.filter(c => c != null && c > 0) || [];
      const last5 = closes.slice(-5);
      const ma5 = last5.length >= 3
        ? Math.round(last5.reduce((a, b) => a + b, 0) / last5.length * 100) / 100
        : null;
      const hi52 = closes.length ? Math.round(Math.max(...closes) * 100) / 100 : null;
      const lo52 = closes.length ? Math.round(Math.min(...closes) * 100) / 100 : null;

      results[code] = { price, ma5, hi52, lo52, ok: true };
    } catch (e) {
      results[code] = { ok: false, error: e.message };
    }
  }));

  res.json(results);
}
