// Purpose:
// Send a welcome email to newly signed-up users.
// Add the user's email to the general BREVO_ALL_CONTACT_LIST_ID
// Trigger:
// 'profiles' table INSERT

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Load environment variables (ensure these are set in Supabase Secrets)
const WELCOME_EMAIL_TEMPLATE_ID = parseInt(
  Deno.env.get("VITE_WELCOME_EMAIL_TEMPLATE_ID") || "1"
);

const SENDER_EMAIL =
  Deno.env.get("VITE_FROM_ADDRESS") || "hello@givegetgoeducation.co.uk";
const SENDER_NAME = Deno.env.get("VITE_APP_NAME") || "GGGE Learning";
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

// Corrected environment variable access for Brevo List IDs
const BREVO_ALL_CONTACT_LIST_ID = parseInt(
  Deno.env.get("VITE_BREVO_ALL_CONTACT_LIST_ID") || "2"
);

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Brevo email send function
async function sendBrevoTemplateEmail(
  toEmail: string,
  templateId: number,
  params: Record<string, any>
) {
  if (!BREVO_API_KEY) {
    console.error("Missing BREVO_API_KEY in Supabase Secrets.");
    return { success: false, message: "API key missing" };
  }
  if (isNaN(templateId) || templateId <= 0) {
    console.error(
      `Invalid templateId provided: ${templateId}. Cannot send email.`
    );
    return { success: false, message: "Invalid template ID" };
  }

  console.log(
    `Sending email to ${toEmail} using template ID ${templateId} with params:`,
    params
  );

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          email: SENDER_EMAIL,
          name: SENDER_NAME,
        },
        to: [
          {
            email: toEmail,
          },
        ],
        templateId,
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo email send error:", response.status, errorData);
      return {
        success: false,
        message: `Brevo email send error: ${response.status} - ${errorData.message}`,
      };
    }

    console.log(`Email sent successfully to ${toEmail}`);
    return {
      success: true,
      message: "Email sent",
    };
  } catch (err: any) {
    console.error("Error sending Brevo email:", err);
    return {
      success: false,
      message: `Network error sending email: ${err.message}`,
    };
  }
}

// ROBUST FUNCTION: Sync contact to Brevo (tries POST first, then PUT if conflict)
async function syncBrevoContact(
  email: string,
  attributes: Record<string, any> = {},
  listIds: number[] = []
) {
  if (!BREVO_API_KEY) {
    console.error(
      "Missing BREVO_API_KEY in Supabase Secrets for contact sync."
    );
    return { success: false, message: "API key missing" };
  }
  if (!email) {
    console.warn("Email is required for Brevo contact sync.");
    return { success: false, message: "Email missing" };
  }

  const contactData = {
    email,
    attributes,
    listIds, // Ensure listIds is an array of numbers, e.g., [2]
    emailBlacklisted: false,
    smsBlacklisted: false,
  };

  console.log(
    `Attempting to sync contact ${email} to Brevo with listIds: ${JSON.stringify(
      listIds
    )}`
  );

  try {
    // 1. Try to CREATE the contact (POST)
    const createResponse = await fetch(`https://api.brevo.com/v3/contacts`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(contactData),
    });

    const createResponseText = await createResponse.text();
    console.log(
      `Brevo POST response status: ${createResponse.status}, body: ${createResponseText}`
    );

    if (createResponse.ok) {
      console.log(`Contact ${email} successfully created in Brevo.`);
      return { success: true, message: "Contact created" };
    } else if (createResponse.status === 409) {
      // 409 Conflict means contact already exists
      console.log(`Contact ${email} already exists. Attempting to update.`);
      // 2. If contact exists, try to UPDATE it (PUT)
      const updateResponse = await fetch(
        `https://api.brevo.com/v3/contacts/${email}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "api-key": BREVO_API_KEY,
          },
          body: JSON.stringify({ attributes, listIds, updateEnabled: true }),
        }
      );

      const updateResponseText = await updateResponse.text();
      console.log(
        `Brevo PUT response status: ${updateResponse.status}, body: ${updateResponseText}`
      );

      if (updateResponse.ok) {
        console.log(`Contact ${email} successfully updated in Brevo.`);
        return { success: true, message: "Contact updated" };
      } else {
        console.error(
          "Brevo contact update error:",
          updateResponse.status,
          updateResponseText
        );
        return {
          success: false,
          message: `Brevo contact update error: ${updateResponse.status} - ${updateResponseText}`,
        };
      }
    } else {
      console.error(
        "Brevo contact creation error:",
        createResponse.status,
        createResponseText
      );
      return {
        success: false,
        message: `Brevo contact creation error: ${createResponse.status} - ${createResponseText}`,
      };
    }
  } catch (err: any) {
    console.error("Error syncing Brevo contact:", err);
    return {
      success: false,
      message: `Network error syncing contact: ${err.message}`,
    };
  }
}

// --- Main Webhook Handler ---
serve(async (req) => {
  try {
    const payload = await req.json();
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    const { type, table, record } = payload;

    // --- Handle New User Signup (profiles INSERT) ---
    if (table === "profiles" && type === "INSERT") {
      const recipientEmail = record.email;
      const username =
        record.username || recipientEmail?.split("@")[0] || "Learner";

      if (!recipientEmail) {
        console.warn(
          "Email missing in profiles record for welcome email and contact sync."
        );
        return new Response(
          JSON.stringify({
            message: "No email found for welcome email/contact sync",
          }),
          { headers: { "Content-Type": "application/json" }, status: 400 }
        );
      }

      // 1. Send Welcome Email
      await sendBrevoTemplateEmail(recipientEmail, WELCOME_EMAIL_TEMPLATE_ID, {
        username,
        email: recipientEmail,
      });

      // 2. Sync Contact to Brevo (add to general "All Contacts" list)
      const brevoAttributes = {
        FIRSTNAME: username,
      };
      await syncBrevoContact(recipientEmail, brevoAttributes, [
        BREVO_ALL_CONTACT_LIST_ID,
      ]);
    } else {
      console.log(
        `Unhandled webhook event: table=${table}, type=${type}. This handler only processes 'profiles' INSERT events.`
      );
    }

    return new Response(JSON.stringify({ message: "Webhook processed" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("Error handling request:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
