// Purpose:
// Send a payment confirmation email (once per session)
// Manage Brevo contact lists: Ensure user is in "Students" list (once per session, with check)
// Trigger:
// 'enrollments' table INSERT (now only one INSERT per multi-course purchase)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Load environment variables (ensure these are set in Supabase Secrets)
const PAYMENT_CONFIRMATION_EMAIL_TEMPLATE_ID = parseInt(
  Deno.env.get("VITE_PAYMENT_SUCCESSFUL_EMAIL_TEMPLATE_ID") || "6"
);

const SENDER_EMAIL =
  Deno.env.get("VITE_FROM_ADDRESS") || "hello@givegetgoeducation.co.uk";
const SENDER_NAME = Deno.env.get("VITE_APP_NAME") || "GGGE Learning";
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

// Corrected environment variable access for Brevo List IDs
const BREVO_ALL_CONTACT_LIST_ID = parseInt(
  Deno.env.get("VITE_BREVO_ALL_CONTACT_LIST_ID") || "2"
);
const BREVO_STUDENTS_LIST_ID = parseInt(
  Deno.env.get("VITE_BREVO_STUDENTS_LIST_ID") || "4"
);

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Brevo email send function (no changes needed here)
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

// Helper to get contact details from Brevo, including list memberships
async function getBrevoContactDetails(email: string): Promise<any | null> {
  if (!BREVO_API_KEY) {
    console.error("Missing BREVO_API_KEY for Brevo contact details fetch.");
    return null;
  }
  if (!email) {
    console.warn("Email is required for fetching Brevo contact details.");
    return null;
  }

  try {
    const response = await fetch(`https://api.brevo.com/v3/contacts/${email}`, {
      method: "GET",
      headers: {
        "api-key": BREVO_API_KEY,
      },
    });

    if (response.ok) {
      return response.json();
    } else if (response.status === 404) {
      console.log(`Contact ${email} not found in Brevo.`);
      return null;
    } else {
      const errorData = await response.json();
      console.error(
        `Brevo contact details fetch error: ${
          response.status
        } - ${JSON.stringify(errorData)}`
      );
      return null;
    }
  } catch (err: any) {
    console.error("Error fetching Brevo contact details:", err);
    return null;
  }
}

// Helper to add a contact to a specific Brevo list (modified to use PUT for existing contacts)
async function addContactToBrevoList(email: string, listId: number) {
  if (!BREVO_API_KEY) {
    console.error("Missing BREVO_API_KEY for Brevo list addition.");
    return { success: false, message: "API key missing" };
  }
  if (!email) {
    console.warn("Email is required for Brevo contact addition.");
    return { success: false, message: "Email missing" };
  }
  if (isNaN(listId) || listId <= 0) {
    console.warn(`Invalid listId provided: ${listId}. Cannot add contact.`);
    return { success: false, message: "Invalid list ID" };
  }

  console.log(`Attempting to add contact ${email} to Brevo list ID: ${listId}`);

  try {
    // Brevo API for adding/removing from lists for existing contacts uses PUT
    const response = await fetch(`https://api.brevo.com/v3/contacts/${email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        listIds: [listId], // Add to this list
        updateEnabled: true, // Allow updates to existing contact
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `Brevo list addition error: ${response.status} - ${JSON.stringify(
          errorData
        )}`
      );
      return {
        success: false,
        message: `Brevo list addition error: ${response.status}`,
      };
    }

    console.log(
      `Contact ${email} successfully added to Brevo list ID: ${listId}.`
    );
    return { success: true, message: "Contact added to list" };
  } catch (err: any) {
    console.error("Error adding Brevo contact to list:", err);
    return {
      success: false,
      message: `Network error adding contact: ${err.message}`,
    };
  }
}

// Helper to remove a contact from a specific Brevo list (no changes needed here)
async function removeContactFromBrevoList(email: string, listId: number) {
  if (!BREVO_API_KEY) {
    console.error("Missing BREVO_API_KEY for Brevo list removal.");
    return { success: false, message: "API key missing" };
  }
  if (!email) {
    console.warn("Email is required for Brevo contact removal.");
    return { success: false, message: "Email missing" };
  }
  if (isNaN(listId) || listId <= 0) {
    console.warn(`Invalid listId provided: ${listId}. Cannot remove contact.`);
    return { success: false, message: "Invalid list ID" };
  }

  console.log(
    `Attempting to remove contact ${email} from Brevo list ID: ${listId}`
  );

  try {
    const response = await fetch(
      `https://api.brevo.com/v3/contacts/${email}/lists/${listId}`,
      {
        method: "DELETE",
        headers: {
          "api-key": BREVO_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      // A 404 here might mean the contact wasn't in that specific list, which is fine.
      if (response.status === 404 && errorData.code === "document_not_found") {
        console.log(
          `Contact ${email} not found in list ${listId}. Skipping removal.`
        );
        return {
          success: true,
          message: "Contact not found in list (already removed or never added)",
        };
      }
      console.error("Brevo list removal error:", response.status, errorData);
      return {
        success: false,
        message: `Brevo list removal error: ${response.status} - ${errorData.message}`,
      };
    }

    console.log(
      `Contact ${email} successfully removed from Brevo list ID: ${listId}.`
    );
    return { success: true, message: "Contact removed from list" };
  } catch (err: any) {
    console.error("Error removing Brevo contact from list:", err);
    return {
      success: false,
      message: `Network error removing contact: ${err.message}`,
    };
  }
}

// Get user's username from profiles
async function getUsernameFromProfiles(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching username from profiles table:", error);
      return null;
    }
    return data?.username || null;
  } catch (err) {
    console.error("Exception fetching username:", err);
    return null;
  }
}

// --- Main Webhook Handler ---
serve(async (req) => {
  try {
    const payload = await req.json();
    console.log(
      "Received enrollment webhook payload:",
      JSON.stringify(payload, null, 2)
    );

    const { type, table, record } = payload;

    // --- Handle One-Time Enrollment (enrollments INSERT) ---
    // This webhook is now triggered only ONCE per multi-course purchase
    if (
      table === "enrollments" &&
      type === "INSERT" &&
      record.status === "completed"
    ) {
      const recipientEmail = record.email;
      const userId = record.user_id;
      const checkoutSessionId = record.stripe_checkout_session_id;

      if (!recipientEmail) {
        console.warn(
          `Email missing in enrollments record for user_id: ${userId}`
        );
        return new Response(
          JSON.stringify({
            message: "No email found for payment confirmation",
          }),
          { headers: { "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Get username from profiles
      const username =
        (await getUsernameFromProfiles(userId)) ||
        recipientEmail.split("@")[0] ||
        "Learner";

      const totalAmountPaid = record.total_price_paid;
      const currency = record.currency;
      const courseIdsBought = record.course_ids;
      const variantIdsBought = record.variant_ids;

      console.log(
        `Processing enrollment for ${recipientEmail}, total payment: ${totalAmountPaid} ${currency}`
      );
      console.log(`Courses bought: ${courseIdsBought.join(", ")}`);
      console.log(`Variants bought: ${variantIdsBought.join(", ")}`);

      // 1. Send Payment Confirmation Email (now guaranteed to be once per session)
      const emailResult = await sendBrevoTemplateEmail(
        recipientEmail,
        PAYMENT_CONFIRMATION_EMAIL_TEMPLATE_ID,
        {
          username,
          payment_id: checkoutSessionId, // Use checkout session ID as payment ID
          amount: `${totalAmountPaid.toLocaleString()} ${currency}`, // Use total amount
          // You could also pass course details here if needed for the email template
          // courses_list: courseIdsBought.join(', ')
        }
      );

      console.log(`Email result:`, emailResult);

      // 2. Manage Brevo Contact Lists (move from ALL_CONTACT_LIST to STUDENTS_LIST)
      // Check if the user is already in the Students list before attempting moves
      const brevoContact = await getBrevoContactDetails(recipientEmail);
      const isAlreadyStudent = brevoContact?.listIds?.includes(
        BREVO_STUDENTS_LIST_ID
      );

      if (isAlreadyStudent) {
        console.log(
          `Contact ${recipientEmail} is already in Students list. Skipping Brevo list updates.`
        );
      } else {
        console.log(
          `Contact ${recipientEmail} is NOT in Students list. Performing Brevo list updates.`
        );
        // Remove from ALL_CONTACT_LIST
        await removeContactFromBrevoList(
          recipientEmail,
          BREVO_ALL_CONTACT_LIST_ID
        );
        // Add to STUDENTS_LIST (this will also create contact if not exists)
        await addContactToBrevoList(recipientEmail, BREVO_STUDENTS_LIST_ID);
        console.log(
          `Brevo contact ${recipientEmail} moved from All Contacts to Students list.`
        );
      }

      return new Response(
        JSON.stringify({
          message: "Enrollment webhook processed",
          email: emailResult,
          brevoStatus: isAlreadyStudent
            ? "Already student, skipped update"
            : "Moved to students list",
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      console.log(
        `Unhandled webhook event: table=${table}, type=${type}, status=${record?.status}`
      );
      return new Response(
        JSON.stringify({ message: "Event not handled by this webhook" }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (err: any) {
    console.error("Error handling enrollment webhook:", err);
    return new Response(
      JSON.stringify({ error: err.message, stack: err.stack }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
