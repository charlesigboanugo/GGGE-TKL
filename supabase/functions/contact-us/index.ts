import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// ---------- Variables declared at the top ----------
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const CONTACT_RECEIVER_EMAIL = "info@yourdomain.com";
const CONTACT_SENDER_EMAIL = "no-reply@yourdomain.com";
const CONTACT_SENDER_NAME = "Your Site";

if (!BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY is not set in environment variables");
}

// ---------- Edge function ----------
serve(async (req) => {
  // Ensure JSON response header
  const headers = { "Content-Type": "application/json" };

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers });
    }

    // Prepare Brevo payload
    const payload = {
      sender: { email: CONTACT_SENDER_EMAIL, name: CONTACT_SENDER_NAME },
      to: [{ email: CONTACT_RECEIVER_EMAIL, name: "Site Admin" }],
      subject: `New Contact Message from ${name}`,
      htmlContent: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Brevo error:", errText);
      return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to send message" }), { status: 500, headers });
  }
});