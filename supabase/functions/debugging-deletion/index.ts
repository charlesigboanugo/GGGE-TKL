// Purpose: Debug webhook payload to understand what data is available during DELETE events
// This will help us understand if old_record contains the email

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

// Main Webhook Handler - Enhanced for debugging
serve(async (req) => {
  console.log(`[BREVO-CLEANUP] Webhook received: ${req.method} ${req.url}`);
  console.log(
    `[BREVO-CLEANUP] Headers:`,
    Object.fromEntries(req.headers.entries())
  );

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { "Content-Type": "application/json" },
        status: 405,
      });
    }

    const payload = await req.json();

    // DETAILED PAYLOAD ANALYSIS
    console.log("=".repeat(80));
    console.log("[BREVO-CLEANUP] FULL WEBHOOK PAYLOAD ANALYSIS");
    console.log("=".repeat(80));
    console.log("Raw payload:", JSON.stringify(payload, null, 2));

    const { type, table, old_record, record, schema } = payload;

    console.log("\n[BREVO-CLEANUP] PARSED PAYLOAD STRUCTURE:");
    console.log(`- Type: ${type}`);
    console.log(`- Table: ${table}`);
    console.log(`- Schema: ${schema}`);
    console.log(`- Has old_record: ${!!old_record}`);
    console.log(`- Has record: ${!!record}`);

    if (old_record) {
      console.log("\n[BREVO-CLEANUP] OLD_RECORD ANALYSIS:");
      console.log(`- old_record keys: ${Object.keys(old_record).join(", ")}`);
      console.log(`- old_record.id: ${old_record.id}`);
      console.log(`- old_record.email: ${old_record.email}`);
      console.log(
        `- old_record.email_confirmed_at: ${old_record.email_confirmed_at}`
      );
      console.log(`- old_record.created_at: ${old_record.created_at}`);
      console.log("- Full old_record:", JSON.stringify(old_record, null, 2));
    } else {
      console.log("\n[BREVO-CLEANUP] ❌ NO OLD_RECORD FOUND!");
    }

    if (record) {
      console.log("\n[BREVO-CLEANUP] RECORD ANALYSIS:");
      console.log(`- record keys: ${Object.keys(record).join(", ")}`);
      console.log("- Full record:", JSON.stringify(record, null, 2));
    } else {
      console.log("\n[BREVO-CLEANUP] ❌ NO RECORD FOUND!");
    }

    // Check if this is a user deletion event
    if ((table === "users" || table === "auth.users") && type === "DELETE") {
      console.log("\n[BREVO-CLEANUP] 🎯 USER DELETE EVENT DETECTED!");

      if (old_record?.id) {
        const userId = old_record.id;
        const userEmail = old_record.email;

        console.log(`[BREVO-CLEANUP] ✅ User deletion data available:`);
        console.log(`- User ID: ${userId}`);
        console.log(`- User Email: ${userEmail}`);
        console.log(
          `- Email is valid: ${!!userEmail && userEmail.includes("@")}`
        );

        if (!userEmail) {
          console.log("❌ CRITICAL ISSUE: Email not found in old_record!");
          console.log(
            "This means the webhook isn't capturing the user email before deletion."
          );
          console.log("Possible solutions:");
          console.log(
            "1. Check if webhook is configured to capture old_record data"
          );
          console.log(
            "2. Modify delete process to pass email in webhook payload"
          );
          console.log(
            "3. Store email in a separate cleanup queue before deletion"
          );

          return new Response(
            JSON.stringify({
              error: "Email not found in old_record",
              debug: {
                old_record,
                suggestions: [
                  "Check webhook configuration for old_record capture",
                  "Modify delete process to include email in payload",
                  "Use cleanup queue before deletion",
                ],
              },
            }),
            { headers: { "Content-Type": "application/json" }, status: 400 }
          );
        }

        console.log(
          `[BREVO-CLEANUP] 🚀 Proceeding with Brevo cleanup for: ${userEmail}`
        );

        // Here you would continue with your Brevo cleanup logic
        // For now, just return success with debug info
        return new Response(
          JSON.stringify({
            message: "User delete event processed successfully",
            debug: {
              userId,
              userEmail,
              webhookWorking: true,
              hasOldRecord: true,
              hasEmail: !!userEmail,
            },
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 }
        );
      } else {
        console.log("❌ CRITICAL ISSUE: No old_record.id found!");
        console.log(
          "This means the webhook isn't being triggered properly or old_record is empty."
        );
        console.log("Check your database webhook configuration.");

        return new Response(
          JSON.stringify({
            error: "No old_record.id found",
            debug: {
              payload,
              issue: "Webhook not capturing deleted record data",
              suggestion: "Check database webhook configuration",
            },
          }),
          { headers: { "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    console.log("\n[BREVO-CLEANUP] ℹ️ Not a user delete event, ignoring.");
    console.log(`Expected: table='users' or 'auth.users' AND type='DELETE'`);
    console.log(`Actual: table='${table}' AND type='${type}'`);

    return new Response(
      JSON.stringify({
        message: "Webhook received but not a user delete event",
        debug: { type, table, schema },
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    console.error("[BREVO-CLEANUP] Error processing webhook:", err);
    console.error("Error stack:", err.stack);

    return new Response(
      JSON.stringify({
        error: err.message,
        stack: err.stack,
        debug: "Failed to process webhook payload",
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
