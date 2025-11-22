// Purpose:
// Remove the user's email from all relevant Brevo contact lists when account is deleted
// Trigger: Database webhook on 'auth.users' table DELETE

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const BREVO_ALL_CONTACT_LIST_ID = parseInt(
  Deno.env.get("BREVO_ALL_CONTACT_LIST_ID") || "2"
);
const BREVO_STUDENTS_LIST_ID = parseInt(
  Deno.env.get("BREVO_STUDENTS_LIST_ID") || "4"
);
const BREVO_MEMBERS_LIST_ID = parseInt(
  Deno.env.get("BREVO_MEMBERS_LIST_ID") || "3"
);

// Add startup logging
console.log("[BREVO-CLEANUP] Function started");
console.log("[BREVO-CLEANUP] Environment check:", {
  hasBrevoApiKey: !!BREVO_API_KEY,
  allListId: BREVO_ALL_CONTACT_LIST_ID,
  studentsListId: BREVO_STUDENTS_LIST_ID,
  membersListId: BREVO_MEMBERS_LIST_ID,
});

// FIXED: Helper to remove a contact from a specific Brevo list
async function removeContactFromBrevoList(email: string, listId: number) {
  console.log(
    `[BREVO-CLEANUP] removeContactFromBrevoList called with email: ${email}, listId: ${listId}`
  );

  if (!BREVO_API_KEY) {
    console.error(
      "[BREVO-CLEANUP] Missing BREVO_API_KEY for Brevo list removal."
    );
    return { success: false, message: "API key missing" };
  }
  if (!email) {
    console.warn(
      "[BREVO-CLEANUP] Email is required for Brevo contact removal."
    );
    return { success: false, message: "Email missing" };
  }
  if (isNaN(listId) || listId <= 0) {
    console.warn(
      `[BREVO-CLEANUP] Invalid listId provided: ${listId}. Cannot remove contact.`
    );
    return { success: false, message: "Invalid list ID" };
  }

  console.log(
    `[BREVO-CLEANUP] Attempting to remove contact ${email} from Brevo list ID: ${listId}`
  );

  try {
    // METHOD 1: POST to remove from specific list (Brevo's bulk remove endpoint)
    const url = `https://api.brevo.com/v3/contacts/lists/${listId}/contacts/remove`;
    console.log(`[BREVO-CLEANUP] Making POST request to: ${url}`);

    const response = await fetch(url, {
      method: "POST", // Yes, POST is correct for this endpoint (bulk action)
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emails: [email], // Array of emails to remove from this list
      }),
    });

    console.log(
      `[BREVO-CLEANUP] Brevo API response status: ${response.status}`
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));

      console.log(`[BREVO-CLEANUP] Brevo API error data:`, errorData);

      // If POST method fails, try DELETE method as fallback
      if (
        response.status === 404 &&
        errorData.message?.includes("Invalid route")
      ) {
        console.log(
          `[BREVO-CLEANUP] POST method failed, trying DELETE method fallback`
        );
        return await removeContactFromBrevoListDelete(email, listId);
      }

      // Handle specific error cases
      if (response.status === 400 && errorData.message?.includes("not found")) {
        console.log(
          `[BREVO-CLEANUP] Contact ${email} not found in list ${listId}. This is normal - contact may not have been in this list.`
        );
        return {
          success: true,
          message: "Contact not found in list (already removed or never added)",
        };
      }

      if (response.status === 404) {
        console.log(
          `[BREVO-CLEANUP] List ID ${listId} not found. Please check your environment variables.`
        );
        return {
          success: false,
          message: `List ID ${listId} not found. Check environment variables.`,
        };
      }

      console.error(
        "[BREVO-CLEANUP] Brevo list removal error:",
        response.status,
        errorData
      );
      return {
        success: false,
        message: `Brevo list removal error: ${response.status} - ${
          errorData.message || "Unknown error"
        }`,
      };
    }

    // Parse response
    const responseData = await response.json().catch(() => ({}));
    console.log(
      `[BREVO-CLEANUP] Contact ${email} successfully removed from Brevo list ID: ${listId}.`,
      responseData
    );
    return {
      success: true,
      message: "Contact removed from list",
      data: responseData,
    };
  } catch (err: any) {
    console.error(
      "[BREVO-CLEANUP] Error removing Brevo contact from list:",
      err
    );
    return {
      success: false,
      message: `Network error removing contact: ${err.message}`,
    };
  }
}

// METHOD 2: DELETE fallback - removes contact from specific list (alternative approach)
async function removeContactFromBrevoListDelete(email: string, listId: number) {
  console.log(
    `[BREVO-CLEANUP] Trying DELETE method for ${email} from list ${listId}`
  );

  try {
    // This endpoint uses DELETE method (more intuitive)
    const url = `https://api.brevo.com/v3/contacts/${email}/lists/${listId}`;
    console.log(`[BREVO-CLEANUP] Making DELETE request to: ${url}`);

    const response = await fetch(url, {
      method: "DELETE", // This makes more sense logically
      headers: {
        "api-key": BREVO_API_KEY,
      },
    });

    console.log(`[BREVO-CLEANUP] DELETE response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      console.log(`[BREVO-CLEANUP] DELETE API error data:`, errorData);

      // 404 might mean contact wasn't in that specific list
      if (response.status === 404) {
        console.log(
          `[BREVO-CLEANUP] Contact ${email} not found in list ${listId} (DELETE method)`
        );
        return {
          success: true,
          message: "Contact not found in list (already removed or never added)",
        };
      }

      return {
        success: false,
        message: `DELETE method error: ${response.status} - ${
          errorData.message || "Unknown error"
        }`,
      };
    }

    console.log(
      `[BREVO-CLEANUP] DELETE successful for ${email} from list ${listId}`
    );
    return {
      success: true,
      message: "Contact removed from list (DELETE method)",
    };
  } catch (err: any) {
    console.error("[BREVO-CLEANUP] DELETE method error:", err);
    return {
      success: false,
      message: `DELETE method network error: ${err.message}`,
    };
  }
}

// Main Webhook Handler
serve(async (req) => {
  console.log(`[BREVO-CLEANUP] Webhook received: ${req.method} ${req.url}`);
  console.log(
    `[BREVO-CLEANUP] Headers:`,
    Object.fromEntries(req.headers.entries())
  );

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      console.log(`[BREVO-CLEANUP] Method ${req.method} not allowed`);
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { "Content-Type": "application/json" },
        status: 405,
      });
    }

    const payload = await req.json();
    console.log(
      "[BREVO-CLEANUP] Received webhook payload:",
      JSON.stringify(payload, null, 2)
    );

    const { type, table, old_record, record, schema } = payload;
    console.log(
      `[BREVO-CLEANUP] Event details - Type: ${type}, Table: ${table}, Schema: ${schema}`
    );

    // Handle User Account Deletion (auth.users DELETE)
    if (
      (table === "users" || table === "auth.users") &&
      type === "DELETE" &&
      old_record?.id
    ) {
      const userId = old_record.id;
      const userEmail = old_record.email;

      console.log(
        `[BREVO-CLEANUP] Processing user deletion - ID: ${userId}, Email: ${userEmail}`
      );

      if (!userEmail) {
        console.warn(
          `[BREVO-CLEANUP] Email missing in old_record for deleted user ID: ${userId}. Cannot remove from Brevo.`
        );
        return new Response(
          JSON.stringify({ message: "Email not found for deleted user" }),
          { headers: { "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log(
        `[BREVO-CLEANUP] User account deleted: ${userId}. Attempting to remove ${userEmail} from Brevo contact lists.`
      );

      // Remove from all relevant lists
      const removalPromises = [
        removeContactFromBrevoList(userEmail, BREVO_ALL_CONTACT_LIST_ID),
        removeContactFromBrevoList(userEmail, BREVO_STUDENTS_LIST_ID),
        removeContactFromBrevoList(userEmail, BREVO_MEMBERS_LIST_ID),
      ];

      console.log(
        `[BREVO-CLEANUP] Starting removal from ${removalPromises.length} lists`
      );
      const results = await Promise.allSettled(removalPromises);

      // Log results for debugging
      results.forEach((result, index) => {
        const listIds = [
          BREVO_ALL_CONTACT_LIST_ID,
          BREVO_STUDENTS_LIST_ID,
          BREVO_MEMBERS_LIST_ID,
        ];
        if (result.status === "fulfilled") {
          console.log(
            `[BREVO-CLEANUP] List ${listIds[index]} removal result:`,
            result.value
          );
        } else {
          console.error(
            `[BREVO-CLEANUP] List ${listIds[index]} removal failed:`,
            result.reason
          );
        }
      });

      console.log(
        `[BREVO-CLEANUP] Finished attempting to remove ${userEmail} from Brevo lists.`
      );

      return new Response(
        JSON.stringify({
          message: "User deleted from Brevo lists",
          email: userEmail,
          userId: userId,
          results: results.map((r) =>
            r.status === "fulfilled" ? r.value : { error: r.reason }
          ),
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      console.log(
        `[BREVO-CLEANUP] Unhandled webhook event: table=${table}, type=${type}, schema=${schema}. This handler only processes 'auth.users' DELETE events.`
      );
      console.log(`[BREVO-CLEANUP] Full payload for debugging:`, payload);
    }

    return new Response(
      JSON.stringify({ message: "Webhook processed successfully" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    console.error("[BREVO-CLEANUP] Error handling webhook request:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
