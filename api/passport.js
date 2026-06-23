// Vercel serverless function — GET /passport?t=<token>  (also reachable at /api/passport)
//
// Public, read-only pet "passport" page for sitters. No login.
//
// Why this proxies Supabase: Supabase Edge Functions cannot serve renderable HTML
// on the default *.supabase.co domain — the platform forces Content-Type:
// text/plain and injects a sandbox CSP (an anti-phishing measure), so the page
// would show as raw source. This route fetches the already-deployed Supabase
// `passport` function server-side and re-serves its HTML with the correct
// Content-Type, which makes browsers render it normally.
//
// The Supabase function remains the single source of truth for the page: it calls
// the get_passport RPC with its own injected anon key and escapes all user text.
// No secrets live here — the supabase.co project URL below is public.

const SUPABASE_PASSPORT_URL =
  'https://gcncvxtixfefoxypghoe.supabase.co/functions/v1/passport';

export default async function handler(req, res) {
  const t = req.query && req.query.t ? String(req.query.t) : '';

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  try {
    const upstream = await fetch(`${SUPABASE_PASSPORT_URL}?t=${encodeURIComponent(t)}`, {
      headers: { accept: 'text/html' },
    });
    const html = await upstream.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Re-serve with our own headers only; upstream's text/plain + sandbox CSP are dropped.
    return res.status(upstream.status).send(html);
  } catch (e) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res
      .status(502)
      .send(
        '<!doctype html><meta charset="utf-8">' +
          '<meta name="viewport" content="width=device-width, initial-scale=1">' +
          '<title>Pet Life Log — Passport</title>' +
          '<body style="margin:0;font-family:ui-rounded,system-ui,-apple-system,sans-serif;background:#ECEFEE;color:#16231F;text-align:center;padding:64px 20px">' +
          '<div style="font-size:34px">🐾</div>' +
          '<h1 style="font-size:21px">Passport temporarily unavailable</h1>' +
          '<p style="color:#5C6A64">Please try opening this link again in a moment.</p></body>',
      );
  }
}
