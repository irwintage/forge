
export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN;
    const origin = request.headers.get("Origin");
    const path = new URL(request.url).pathname;

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Vary": "Origin",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (allowed && origin === allowed) {
      headers["Access-Control-Allow-Origin"] = allowed;
    }

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers
      });

    if (!allowed || !env.DB) {
      return json({ error: "Server not configured" }, 503);
    }

    if (request.method === "OPTIONS") {
      if (origin !== allowed) {
        return json({ error: "Origin not allowed" }, 403);
      }

      return new Response(null, { status: 204, headers });
    }

    if (origin !== allowed) {
      return json({ error: "Origin not allowed" }, 403);
    }

    const route = path.match(
      /^\/api\/tools\/([a-z0-9-]+)\/ratings$/
    );

    if (route && request.method === "GET") {
      const result = await env.DB.prepare(
        "SELECT COUNT(*) AS count, AVG(stars) AS average FROM ratings WHERE tool_id = ?"
      ).bind(route[1]).first();

      return json({
        count: result?.count || 0,
        average: result?.average || 0
      });
    }

    if (
      request.method !== "POST" ||
      (!route && path !== "/api/feedback")
    ) {
      return json({ error: "Not found" }, 404);
    }

    const contentType =
      request.headers.get("Content-Type") || "";

    if (!contentType.includes("application/json")) {
      return json({ error: "JSON required" }, 415);
    }

    const raw = await request.text();

    if (raw.length > 4500) {
      return json({ error: "Payload too long" }, 413);
    }

    let body;

    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return json({ error: "Invalid payload" }, 400);
    }

    // Validate the submitted data
    let rating = null;
    let feedback = null;

    if (route) {
      const stars = body.stars;
      const voterId = body.voterId;

      if (
        !Number.isInteger(stars) ||
        stars < 1 ||
        stars > 5
      ) {
        return json({ error: "Choose 1-5 stars" }, 400);
      }

      if (
        typeof voterId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(voterId)
      ) {
        return json(
          { error: "Browser voting ID missing or invalid" },
          400
        );
      }

      rating = {
        toolId: route[1],
        stars,
        voterId: voterId.toLowerCase()
      };
    } else {
      if (typeof body.message !== "string") {
        return json({ error: "Invalid message" }, 400);
      }

      const message = body.message.trim();
      const toolId = body.toolId ?? "";

      if (
        typeof toolId !== "string" ||
        message.length < 8 ||
        message.length > 1500 ||
        !/^([a-z0-9-]{1,80})?$/.test(toolId)
      ) {
        return json({ error: "Invalid feedback" }, 400);
      }

      feedback = {
        type: body.type === "bug" ? "bug" : "feedback",
        message,
        toolId
      };
    }

    // Verify Cloudflare Turnstile
    const token = body.turnstileToken;

    if (
      !env.TURNSTILE_SECRET ||
      typeof token !== "string" ||
      !token
    ) {
      return json(
        { error: "Human verification required" },
        403
      );
    }

    const form = new FormData();

    form.set("secret", env.TURNSTILE_SECRET);
    form.set("response", token);

    const ip = request.headers.get("CF-Connecting-IP");

    if (ip) {
      form.set("remoteip", ip);
    }

    let verification;

    try {
      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: form
        }
      );

      if (!response.ok) {
        throw new Error("Turnstile unavailable");
      }

      verification = await response.json();
    } catch {
      return json(
        { error: "Verification unavailable" },
        503
      );
    }

    if (!verification.success) {
      return json({ error: "Verification failed" }, 403);
    }

    // Anti-spam: maximum 10 envois par IP et par minute
    const minute = Math.floor(Date.now() / 60000);

    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(env.TURNSTILE_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode("forge-rate-limit:" + (ip || "unknown"))
    );

    const visitorId = Array.from(
      new Uint8Array(signature),
      b => b.toString(16).padStart(2, "0")
    ).join("");

    const limit = await env.DB.prepare(`
      INSERT INTO rate_limits
        (visitor_id, window_start, request_count)
      VALUES (?, ?, 1)
      ON CONFLICT(visitor_id, window_start)
      DO UPDATE SET request_count = request_count + 1
      RETURNING request_count
    `).bind(visitorId, minute).first();

    if (limit.request_count > 10) {
      return json(
        { error: "Too many submissions. Please try again in a minute." },
        429
      );
    }


    // Ratings: insert or update, never duplicate
    if (rating) {
      await env.DB.prepare(`
        INSERT INTO ratings (tool_id, stars, voter_id)
        VALUES (?, ?, ?)
        ON CONFLICT(tool_id, voter_id)
        DO UPDATE SET stars = excluded.stars
      `).bind(
        rating.toolId,
        rating.stars,
        rating.voterId
      ).run();

      return json({ ok: true }, 200);
    }

    // Feedback remains unchanged
    await env.DB.prepare(
      "INSERT INTO feedback (tool_id, type, message) VALUES (?, ?, ?)"
    ).bind(
      feedback.toolId || null,
      feedback.type,
      feedback.message
    ).run();

    return json({ ok: true }, 201);
  }
};
