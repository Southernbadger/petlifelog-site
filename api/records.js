// Vercel serverless function — GET /records?t=<token>  (also /api/records)
//
// Public, read-only record-share page. Same approach as /passport: Supabase Edge
// Functions can't serve renderable HTML on the *.supabase.co domain (forced text/plain
// + sandbox CSP), so this route fetches the deployed `record-share` function server-side
// and re-serves its HTML with the correct Content-Type so browsers render it.
//
// The record-share function validates the token and signs private file URLs with the
// service role; no secret lives here. The supabase.co project URL below is public.

const SUPABASE_RECORD_SHARE_URL =
  'https://gcncvxtixfefoxypghoe.supabase.co/functions/v1/record-share';

export default async function handler(req, res) {
  const t = req.query && req.query.t ? String(req.query.t) : '';

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  try {
    const upstream = await fetch(`${SUPABASE_RECORD_SHARE_URL}?t=${encodeURIComponent(t)}`, {
      headers: { accept: 'text/html' },
    });
    const html = await upstream.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(upstream.status).send(html);
  } catch (e) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res
      .status(502)
      .send(
        '<!doctype html><meta charset="utf-8">' +
          '<meta name="viewport" content="width=device-width, initial-scale=1">' +
          '<title>WagNote — Shared records</title>' +
          '<body style="margin:0;font-family:ui-rounded,system-ui,-apple-system,sans-serif;background:#ECEFEE;color:#16231F;text-align:center;padding:64px 20px">' +
          '<div style="font-size:34px">🐾</div>' +
          '<h1 style="font-size:21px">Records temporarily unavailable</h1>' +
          '<p style="color:#5C6A64">Please try opening this link again in a moment.</p></body>',
      );
  }
}
