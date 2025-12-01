// Purpose:
// Handle contact form submissions and send email to admin using Brevo

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// ---------- Environment Variables (same style as subscription handler) ----------
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const SENDER_EMAIL = Deno.env.get("VITE_FROM_ADDRESS");
const SENDER_NAME = Deno.env.get("VITE_APP_NAME");
const CONTACT_RECEIVER_EMAIL = Deno.env.get("VITE_CONTACT_RECEIVER_EMAIL") ||
  "info@yourdomain.com";

// ---------- Validations ----------
if (!BREVO_API_KEY) throw new Error("Missing BREVO_API_KEY in environment");
if (!SENDER_EMAIL) throw new Error("Missing VITE_FROM_ADDRESS");
if (!SENDER_NAME) throw new Error("Missing VITE_APP_NAME");

console.log("BREVO KEY:", BREVO_API_KEY);
console.log("Sender:", { email: SENDER_EMAIL, name: SENDER_NAME });

// ---------- Shared Email Sender (same pattern as subscriptions) ----------
async function sendBrevoEmail(toEmail: string, subject: string, htmlContent: string) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email: toEmail }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Brevo email error:", errorData);
      throw new Error("Failed to send Brevo email");
    }

    console.log(`Contact email sent to admin: ${toEmail}`);
  } catch (err) {
    console.error("Error sending Brevo email:", err);
    throw err;
  }
}

// ---------- Main HTTP Handler ----------
serve(async (req) => {
  const headers = { "Content-Type": "application/json" };

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    const { name, email, message } = await req.json();

    // Basic Validation
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers,
      });
    }

    // Email Subject + Body (same formatting style)
    const subject = `New Contact Message from ${name}`;
    const html = `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `;

    // Send using shared Brevo sender
    await sendBrevoEmail(CONTACT_RECEIVER_EMAIL, subject, html);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(JSON.stringify({ error: "Failed to send message" }), {
      status: 500,
      headers,
    });
  }
});