exports.handler = async function (event) {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  try {
    const { email, tags } = JSON.parse(event.body || "{}");
    const tagValue = Array.isArray(tags) ? tags.join(",") : tags || "";

    if (!email || !/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(String(email))) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ ok: false, error: "Invalid email address" }),
      };
    }

    // Mailchimp JSONP endpoint
    const u = "de14f9e1de5e70d726b870a4e";
    const id = "49f5f16177";
    const dc = "us5"; // data center from your URL
    const cb = "mc_fn_cb"; // fixed wrapper for easier parsing
    const honeypot = "b_de14f9e1de5e70d726b870a4e_49f5f16177";

    const base = `https://journeysapparel.${dc}.list-manage.com/subscribe/post-json`;
    const params = new URLSearchParams({
      u,
      id,
      c: cb,
      EMAIL: String(email),
    });
    if (tagValue) params.append("tags", tagValue);
    params.append(honeypot, "");

    const url = `${base}?${params.toString()}`;

    // Native fetch is available in Netlify functions runtime (Node 18+)
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/javascript,text/javascript;q=0.9,*/*;q=0.8",
      },
    });
    const text = await res.text();

    // Parse JSONP robustly: prefer callback wrapper, otherwise extract first {...}
    let data;
    try {
      const start = text.indexOf(`${cb}(`);
      const end = text.lastIndexOf(")");
      if (start !== -1 && end !== -1 && end > start) {
        const jsonStr = text.slice(start + cb.length + 1, end);
        data = JSON.parse(jsonStr);
      } else {
        const b1 = text.indexOf("{");
        const b2 = text.lastIndexOf("}");
        if (b1 !== -1 && b2 !== -1 && b2 > b1) {
          const jsonOnly = text.slice(b1, b2 + 1);
          data = JSON.parse(jsonOnly);
        }
      }
    } catch (e) {
      // ignore and handle below
    }

    if (!data) {
      return {
        statusCode: 502,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          ok: false,
          error: "Unexpected response from Mailchimp",
        }),
      };
    }

    const ok = data && String(data.result).toLowerCase() === "success";
    let message =
      data && data.msg
        ? String(data.msg)
            .replace(/<[^>]+>/g, "")
            .trim()
        : "";
    if (!ok && /already\s+subscribed/i.test(message)) {
      message = "You're already subscribed.";
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok, message }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: false, error: "Server error" }),
    };
  }
};
