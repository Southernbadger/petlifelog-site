// Vercel serverless function  —  POST /api/subscribe
// Adds an email to the MailerLite "Waitlist" group, instant single opt-in.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const email = (body && body.email ? String(body.email) : '').trim();

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return res.status(422).json({ error: 'Please enter a valid email address.' });
  }

  const API_KEY = process.env.MAILERLITE_API_KEY;
  const GROUP_ID = process.env.MAILERLITE_GROUP_ID;
  if (!API_KEY || !GROUP_ID) {
    return res.status(500).json({ error: 'Server not configured.' });
  }

  try {
    const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email: email, groups: [GROUP_ID], status: 'active' })
    });

    if (mlRes.ok) {
      return res.status(200).json({ ok: true });
    }

    let detail = '';
    try { const j = await mlRes.json(); detail = (j && j.message) ? j.message : ''; } catch (e) {}
    return res.status(mlRes.status === 422 ? 422 : 502).json({
      error: detail || 'Could not add you right now. Please try again.'
    });
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach the mailing service. Please try again.' });
  }
}
