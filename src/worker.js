// Cloudflare Worker entry point for the Chef Godwin site.
// Static files are served through the ASSETS binding; /api/lead is handled here.

const TABLES = {
  catering: {
    table: "catering_bookings",
    fields: ["name", "phone", "email", "event_type", "event_date", "venue", "guests", "message"],
  },
  school: {
    table: "school_applications",
    fields: ["name", "phone", "email", "course", "intake", "message"],
  },
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });

async function handleLead(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const spec = TABLES[payload.kind];
  if (!spec) return json({ error: "Unknown form." }, 400);

  // Honeypot: return success without processing bot submissions.
  if (payload.website) return json({ ok: true });

  // Verify Turnstile when a secret has been configured in Worker secrets.
  if (env.TURNSTILE_SECRET) {
    const body = new FormData();
    body.append("secret", env.TURNSTILE_SECRET);
    body.append("response", payload.turnstileToken || "");
    body.append("remoteip", request.headers.get("CF-Connecting-IP") || "");

    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const result = await check.json();
    if (!result.success) {
      return json({ error: "Security check failed. Please try again." }, 400);
    }
  }

  const row = {};
  for (const field of spec.fields) {
    let value = payload.data?.[field];
    if (typeof value === "string") value = value.trim().slice(0, 1000);
    row[field] = value === "" || value === undefined ? null : value;
  }

  if (row.guests !== null) row.guests = Number.parseInt(row.guests, 10) || null;
  if (!row.name || !row.phone) {
    return json({ error: "Name and phone are required." }, 400);
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return json({ error: "The form service is not configured. Please use WhatsApp instead." }, 503);
  }

  const response = await fetch(
    `${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${spec.table}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    },
  );

  if (!response.ok) {
    return json({ error: "Could not save your request. Please use WhatsApp instead." }, 502);
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/lead") {
      return handleLead(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
