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
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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


async function handleStaffInvite(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return json({ error: "Staff invitation is not configured." }, 503);

  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return json({ error: "Sign in as the Super Administrator first." }, 401);
  const base = env.SUPABASE_URL.endsWith("/") ? env.SUPABASE_URL.slice(0, -1) : env.SUPABASE_URL;
  const serviceHeaders = { apikey: env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_KEY };
  const authResponse = await fetch(base + "/auth/v1/user", {
    headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + token }
  });
  if (!authResponse.ok) return json({ error: "Your session is invalid. Please sign in again." }, 401);
  const authUser = await authResponse.json();

  const profileResponse = await fetch(base + "/rest/v1/staff_profiles?id=eq." + encodeURIComponent(authUser.id) + "&select=role,is_active", { headers: serviceHeaders });
  const profiles = await profileResponse.json();
  if (!profileResponse.ok || !profiles || !profiles[0] || profiles[0].role !== "owner" || profiles[0].is_active !== true) {
    return json({ error: "Only the Super Administrator can invite staff." }, 403);
  }

  let payload;
  try { payload = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  const email = String(payload.email || "").trim().toLowerCase();
  const fullName = String(payload.full_name || "").trim().slice(0, 120);
  const phone = String(payload.phone || "").trim().slice(0, 40);
  const role = String(payload.role || "");
  const allowedRoles = ["admin", "manager", "content_editor", "chef", "events", "admissions", "finance", "receptionist"];
  if (!email || !email.includes("@") || !email.split("@")[1].includes(".") || !fullName || !allowedRoles.includes(role)) {
    return json({ error: "Enter a valid email, full name and permitted staff role." }, 400);
  }

  const inviteResponse = await fetch(base + "/auth/v1/invite?redirect_to=" + encodeURIComponent(new URL("/login", request.url).toString()), {
    method: "POST",
    headers: { ...serviceHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ email, data: { full_name: fullName } })
  });
  const invited = await inviteResponse.json().catch(() => ({}));
  if (!inviteResponse.ok || !invited.id) {
    return json({ error: invited.msg || invited.message || invited.error_description || "Could not send the invitation. Check whether this email already has an account." }, 400);
  }

  const profileWrite = await fetch(base + "/rest/v1/staff_profiles", {
    method: "POST",
    headers: { ...serviceHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ id: invited.id, full_name: fullName, phone: phone || null, role, is_active: true })
  });
  if (!profileWrite.ok) {
    return json({ error: "The invitation was sent, but the staff profile could not be created. Contact the administrator before inviting this email again." }, 502);
  }
  return json({ ok: true, message: "Invitation sent to " + email + ". The staff member must accept the email invitation to activate their login." });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/config") {
      if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
      // Only return browser-safe Supabase settings. Never expose SUPABASE_SERVICE_KEY.
      const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "";
      const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || "";
      if (!supabaseUrl || !publishableKey) {
        return new Response(JSON.stringify({ error: "Public Supabase configuration is unavailable in Worker runtime secrets." }), {
          status: 503,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      }
      return new Response(JSON.stringify({ supabaseUrl, supabasePublishableKey: publishableKey }), {
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store, max-age=0" },
      });
    }
    if (url.pathname === "/api/lead") return handleLead(request, env);
    if (url.pathname === "/api/staff/invite") return handleStaffInvite(request, env);
    return env.ASSETS.fetch(request);
  },
}
