// Cloudflare Pages Function: POST /api/lead
// Verifies Turnstile, validates the payload, and inserts into Supabase using the service key.

const TABLES = {
  catering: { table: 'catering_bookings', fields: ['name', 'phone', 'event_type', 'event_date', 'venue', 'guests', 'message'] },
  school: { table: 'school_applications', fields: ['name', 'phone', 'course', 'intake', 'message'] }
};

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors } });

export const onRequestOptions = () => new Response(null, { status: 204, headers: cors });

export async function onRequestPost({ request, env }) {
  let payload;
  try { payload = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  const spec = TABLES[payload.kind];
  if (!spec) return json({ error: 'Unknown form' }, 400);

  // Honeypot: pretend success so bots learn nothing
  if (payload.website) return json({ ok: true });

  // Turnstile (skipped only if no secret is configured, e.g. local dev)
  if (env.TURNSTILE_SECRET) {
    const body = new FormData();
    body.append('secret', env.TURNSTILE_SECRET);
    body.append('response', payload.turnstileToken || '');
    body.append('remoteip', request.headers.get('CF-Connecting-IP') || '');
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const result = await check.json();
    if (!result.success) return json({ error: 'Security check failed. Please try again.' }, 400);
  }

  const row = {};
  for (const f of spec.fields) {
    let v = payload.data?.[f];
    if (typeof v === 'string') v = v.trim().slice(0, 1000);
    row[f] = v === '' || v === undefined ? null : v;
  }
  if (row.guests !== null) row.guests = parseInt(row.guests, 10) || null;
  if (!row.name || !row.phone) return json({ error: 'Name and phone are required.' }, 400);

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${spec.table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(row)
  });

  if (!res.ok) return json({ error: 'Could not save your request. Please use WhatsApp instead.' }, 502);
  return json({ ok: true });
}
