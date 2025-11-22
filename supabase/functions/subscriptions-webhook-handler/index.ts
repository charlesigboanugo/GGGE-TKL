// Purpose:
// Send subscription activation/deactivation status emails
// Add/remove the user's contact from BREVO_MEMBERS_LIST_ID and BREVO_STUDENT_LIST_ID explicitly
// Trigger: 'user_subscriptions' table INSERT, UPDATE, & DELETE

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Load environment variables
const SUBSCRIPTION_ACTIVATION_EMAIL_TEMPLATE_ID = parseInt(
  Deno.env.get("VITE_SUBSCRIPTION_ACTIVATION_EMAIL_TEMPLATE_ID") || "11"
);
const SUBSCRIPTION_CANCELED_EMAIL_TEMPLATE_ID = parseInt(
  Deno.env.get("VITE_SUBSCRIPTION_CANCELED_EMAIL_TEMPLATE_ID") || "12"
);
const SUBSCRIPTION_PAYMENT_FAILED_EMAIL_TEMPLATE_ID = parseInt(
  Deno.env.get("VITE_SUBSCRIPTION_PAYMENT_FAILED_EMAIL_TEMPLATE_ID") || "13"
);
const SENDER_EMAIL =
  Deno.env.get("VITE_FROM_ADDRESS") || "hello@givegetgoeducation.co.uk";
const SENDER_NAME = Deno.env.get("VITE_APP_NAME") || "GGGE Learning";
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const BREVO_ALL_CONTACT_LIST_ID = parseInt(
  Deno.env.get("VITE_BREVO_ALL_CONTACT_LIST_ID") || "2"
);
const BREVO_MEMBERS_LIST_ID = parseInt(
  Deno.env.get("VITE_BREVO_MEMBERS_LIST_ID") || "3"
);
const BREVO_STUDENT_LIST_ID = parseInt(
  Deno.env.get("VITE_BREVO_STUDENT_LIST_ID") || "4"
);

// Validate env vars
if (!BREVO_API_KEY)
  throw new Error("Missing BREVO_API_KEY in Supabase Secrets");
if (!Deno.env.get("SUPABASE_URL") || !Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))
  throw new Error("Missing Supabase URL or service role key");

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function sendBrevoTemplateEmail(
  toEmail: string,
  templateId: number,
  params: any
) {
  if (isNaN(templateId) || templateId <= 0) {
    console.error(`Invalid templateId: ${templateId}`);
    throw new Error("Invalid template ID");
  }

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
        templateId,
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Brevo email error: ${response.status} - ${errorData.message}`
      );
    }
    console.log(`Email sent to ${toEmail}`);
  } catch (err) {
    console.error("Network error sending email:", err);
  }
}

// Remove from specific Brevo list
async function removeFromBrevoList(listId: number, email: string) {
  try {
    const res = await fetch(
      `https://api.brevo.com/v3/contacts/lists/${listId}/contacts/remove`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
        body: JSON.stringify({ emails: [email] }),
      }
    );
    if (!res.ok) {
      const errData = await res.json();
      console.error(
        `Failed to remove ${email} from list ${listId}:`,
        res.status,
        errData
      );
    } else {
      console.log(`Removed ${email} from list ${listId}`);
    }
  } catch (e) {
    console.error(`Error removing ${email} from list ${listId}:`, e);
  }
}

// Add to Brevo lists (overwrites if needed)
async function addToBrevoLists(
  email: string,
  attributes: any,
  listIds: number[]
) {
  try {
    const res = await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
        body: JSON.stringify({
          attributes,
          listIds,
          updateEnabled: true,
        }),
      }
    );
    if (!res.ok) {
      const errData = await res.json();
      console.error(`Failed to add ${email} to lists:`, res.status, errData);
    } else {
      console.log(`Added ${email} to lists: ${listIds}`);
    }
  } catch (e) {
    console.error(`Error adding ${email} to lists:`, e);
  }
}

async function getEmailAndUsernameFromProfiles(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("email, username")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Error fetching profile: ${error.message}`);
  }

  return {
    email: data?.email || null,
    username: data?.username || null,
  };
}

serve(async (req) => {
  try {
    const payload = await req.json();
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    const { type, table, record, old_record } = payload;

    if (table !== "user_subscriptions") {
      console.log(`Unhandled event: table=${table}, type=${type}`);
      return new Response(JSON.stringify({ message: "Ignored" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const recordToUse = type === "DELETE" ? old_record : record;
    const profile = await getEmailAndUsernameFromProfiles(recordToUse.user_id);
    const recipientEmail = profile.email;
    const username =
      profile.username || recipientEmail?.split("@")[0] || "Learner";

    if (!recipientEmail) throw new Error("No email found");

    // Handle unsubscribe (DELETE)
    if (type === "DELETE") {
      await sendBrevoTemplateEmail(
        recipientEmail,
        SUBSCRIPTION_CANCELED_EMAIL_TEMPLATE_ID,
        { username, subscription_id: recordToUse.stripe_subscription_id }
      );

      // Explicitly remove from members, add to students
      await removeFromBrevoList(BREVO_MEMBERS_LIST_ID, recipientEmail);
      await addToBrevoLists(
        recipientEmail,
        { IS_MEMBER: false, IS_STUDENT: true },
        [BREVO_ALL_CONTACT_LIST_ID, BREVO_STUDENT_LIST_ID]
      );

      console.log(`Processed unsubscribe for ${recipientEmail}`);
      return new Response(
        JSON.stringify({ message: "Unsubscribe processed" }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // For INSERT/UPDATE: handle status change
    const currentStatus = recordToUse.status;
    const oldStatus = old_record?.status;

    if (currentStatus !== oldStatus) {
      if (currentStatus === "active" || currentStatus === "trialing") {
        await sendBrevoTemplateEmail(
          recipientEmail,
          SUBSCRIPTION_ACTIVATION_EMAIL_TEMPLATE_ID,
          { username, subscription_id: recordToUse.stripe_subscription_id }
        );

        // Remove from student, add to members
        await removeFromBrevoList(BREVO_STUDENT_LIST_ID, recipientEmail);
        await addToBrevoLists(
          recipientEmail,
          { IS_MEMBER: true, IS_STUDENT: false },
          [BREVO_ALL_CONTACT_LIST_ID, BREVO_MEMBERS_LIST_ID]
        );

        console.log(`Activated member for ${recipientEmail}`);
      } else if (
        currentStatus === "canceled" ||
        currentStatus === "past_due" ||
        currentStatus === "unpaid"
      ) {
        await sendBrevoTemplateEmail(
          recipientEmail,
          SUBSCRIPTION_CANCELED_EMAIL_TEMPLATE_ID,
          { username, subscription_id: recordToUse.stripe_subscription_id }
        );

        // Remove from members, add to students
        await removeFromBrevoList(BREVO_MEMBERS_LIST_ID, recipientEmail);
        await addToBrevoLists(
          recipientEmail,
          { IS_MEMBER: false, IS_STUDENT: true },
          [BREVO_ALL_CONTACT_LIST_ID, BREVO_STUDENT_LIST_ID]
        );

        console.log(`Moved ${recipientEmail} to student list`);
      }
    }

    return new Response(JSON.stringify({ message: "Webhook processed" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Error handling webhook:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
