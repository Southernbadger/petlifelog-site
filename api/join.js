// Vercel serverless function — GET /join/:code  (also /api/join?code=...)
//
// The no-app fallback for WagNote family invite links (https://wagnote.app/join/WAG-XXXX).
// With the app installed, iOS Universal Links open the app directly (the
// /.well-known/apple-app-site-association file claims /join/*) and this page is never seen.
// Without the app, this page shows the invite code, an App Store button, and how to join.
//
// The code arrives from the URL: it is STRICTLY validated (letters/digits/hyphens only) and
// uppercased before it is ever placed into HTML — anything else renders the generic page with
// no echoed input.

const CODE_RE = /^[A-Za-z0-9-]{1,32}$/;
const APP_STORE_URL = 'https://apps.apple.com/app/id6783609217';

export default function handler(req, res) {
  const raw = req.query && req.query.code ? String(req.query.code) : '';
  const code = CODE_RE.test(raw) ? raw.toUpperCase() : null;

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  const codeBlock = code
    ? `<div class="code-box"><div class="code-label">Your invite code</div><div class="code">${code}</div></div>`
    : `<div class="code-box"><div class="code-label">Your invite code</div><div class="code-missing">Check the message you were sent — your WAG-XXXX code is in it. Enter it in the app.</div></div>`;

  const openHref = code ? `https://wagnote.app/join/${code}` : 'https://wagnote.app';
  const stepThree = code
    ? `or open WagNote &rarr; Account &rarr; Enter an invite code &rarr; type <strong>${code}</strong>.`
    : 'or open WagNote &rarr; Account &rarr; Enter an invite code &rarr; type the code from your message.';

  return res.status(200).send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>You're invited — WagNote</title>
<link rel="icon" href="/wagnote-icon.png" />
<link rel="apple-touch-icon" href="/wagnote-icon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,500;0,700;0,800;1,500;1,700&display=swap" rel="stylesheet" />
<style>
  :root{
    --bg:#ECEFEE; --ink:#16231F; --ink-soft:#46564F; --muted:#5C6A64;
    --teal-1:#157D63; --teal-2:#0B5849; --teal-ink:#176451;
    --accent-1:#1C8268; --accent-2:#0F6E56;
    --clay-accent:0 10px 22px rgba(11,88,73,.28);
  }
  *{box-sizing:border-box}
  body{margin:0;font-family:'Nunito',system-ui,sans-serif;color:var(--ink);background:var(--bg);-webkit-font-smoothing:antialiased;}
  .wrap{max-width:520px;margin:0 auto;padding:36px 20px 60px;text-align:center;}
  .brand{display:flex;align-items:center;justify-content:center;gap:11px;margin-bottom:26px;}
  .brand img{width:56px;height:56px;border-radius:16px;box-shadow:var(--clay-accent);}
  .brand .name{font-weight:800;font-size:1.5rem;letter-spacing:-.01em;color:var(--teal-ink);}
  h1{font-weight:800;font-size:clamp(1.5rem,5vw,1.95rem);line-height:1.12;letter-spacing:-.01em;margin:0 0 10px;}
  .sub{font-weight:500;font-style:italic;font-size:1.02rem;line-height:1.5;color:var(--ink-soft);margin:0 0 24px;}
  .code-box{background:#fff;border-radius:18px;padding:18px 16px;margin:0 0 22px;box-shadow:0 6px 18px rgba(22,35,31,.08);}
  .code-label{font-weight:700;font-size:.62rem;letter-spacing:.16em;color:var(--teal-1);text-transform:uppercase;margin-bottom:6px;}
  .code{font-weight:800;font-size:2rem;letter-spacing:.14em;color:var(--ink);}
  .code-missing{font-weight:500;font-size:.95rem;line-height:1.5;color:var(--muted);}
  .btn{display:block;width:100%;border:none;cursor:pointer;text-decoration:none;font-family:inherit;font-weight:800;font-size:1rem;border-radius:13px;padding:14px 20px;margin:0 0 12px;transition:transform .15s ease;}
  .btn-primary{color:#fff;background:linear-gradient(160deg,var(--accent-1),var(--accent-2));box-shadow:var(--clay-accent);}
  .btn-primary:hover{transform:translateY(-1px);}
  .btn-store{color:#fff;background:linear-gradient(160deg,var(--teal-1),var(--teal-2));box-shadow:var(--clay-accent);}
  .btn-disabled{color:var(--muted);background:#DDE3E1;box-shadow:none;cursor:default;}
  .steps{background:#fff;border-radius:18px;padding:18px 20px;margin-top:24px;text-align:left;box-shadow:0 6px 18px rgba(22,35,31,.08);}
  .steps .head{font-weight:800;font-size:.8rem;letter-spacing:.13em;text-transform:uppercase;color:var(--teal-ink);margin-bottom:10px;}
  .steps ol{margin:0;padding-left:20px;color:var(--ink-soft);font-weight:500;font-size:.96rem;line-height:1.6;}
  .steps li{margin-bottom:6px;}
</style>
</head>
<body>
<div class="wrap">
  <div class="brand"><img src="/wagnote-icon.png" alt="WagNote" /><span class="name">WagNote</span></div>
  <h1>You&rsquo;ve been invited to WagNote</h1>
  <p class="sub">Someone wants you to help care for their pets &mdash; meds, meals, potty, vet records, all in one place.</p>
  ${codeBlock}
  <a class="btn btn-primary" href="${openHref}">Open in WagNote</a>
  <a class="btn btn-store" href="${APP_STORE_URL}">Download on the App&nbsp;Store</a>
  <span class="btn btn-disabled" aria-disabled="true">Google Play &mdash; Coming soon</span>
  <div class="steps">
    <div class="head">New here?</div>
    <ol>
      <li>Get the free app from the App Store.</li>
      <li>Come back and tap this link again &mdash; it&rsquo;ll open the app.</li>
      <li>${stepThree}</li>
    </ol>
  </div>
</div>
</body>
</html>`);
}
