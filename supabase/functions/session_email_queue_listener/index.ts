// Purpose:
// Send a payment confirmation email (once per session)
// Trigger:
// 'session_email_queue' table INSERT

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Environment Variables
const PAYMENT_CONFIRMATION_EMAIL_TEMPLATE_ID = parseInt(
  Deno.env.get("VITE_PAYMENT_SUCCESSFUL_EMAIL_TEMPLATE_ID") || "9"
);
const SENDER_EMAIL = Deno.env.get("VITE_FROM_ADDRESS") || "";
const SENDER_NAME = Deno.env.get("VITE_APP_NAME") || "TKOC Learning";
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

// Supabase Admin Client
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

// --- Helper Functions ---
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

// --- Main Trigger Handler ---
serve(async (req) => {
  try {
    const payload = await req.json();
    console.log("Trigger payload received:", payload);

    const { type, table, record } = payload;

    // Only respond to INSERT on session_email_queue
    if (table === "session_email_queue" && type === "INSERT") {
      const { email, user_id, course_ids, cohort_ids, total_price_paid, currency, stripe_checkout_session_id, id, cohort_variant_ids, course_variant_ids} = record;

      if (!email) {
        console.warn(
          `Email missing in enrollments record for user_id: ${user_id}`
        );
        return new Response(
          JSON.stringify({
            message: "No email found for payment confirmation",
          }),
          { headers: { "Content-Type": "application/json" }, status: 400 }
        );
      }

      const username = (await getUsernameFromProfiles(user_id)) || email.split("@")[0];



      // Group variants by course
      const courseMap: Record<string, string[]> = {};

      for (let i = 0; i < course_ids.length; i++) {
        const course = course_ids[i];
        const variant = course_variant_ids[i];
        if (!courseMap[course]) courseMap[course] = [];
        courseMap[course].push(variant);
      }

      // Create a display string
      const coursesWithVariants = Object.entries(courseMap)
        .map(([course, variants]) => `${course}: ${variants.join(", ")}`)
        .join("\n");

      console.log(coursesWithVariants);


      // Group cohort variants by cohort
      const cohortMap: Record<string, string[]> = {};

      for (let i = 0; i < cohort_ids.length; i++) {
        const cohort = cohort_ids[i];
        const variant = cohort_variant_ids[i];
        if (!cohortMap[cohort]) cohortMap[cohort] = [];
        cohortMap[cohort].push(variant);
      }

      // Create a display string for email
      const cohortsWithVariants = Object.entries(cohortMap)
        .map(([cohort, variants]) => `${cohort}: ${variants.join(", ")}`)
        .join("\n");

      console.log(cohortsWithVariants);

      // Send activation email
      const emailResult = await sendBrevoTemplateEmail(email, PAYMENT_CONFIRMATION_EMAIL_TEMPLATE_ID, {
        username,
        amount: `${total_price_paid.toLocaleString()} ${currency}`,
        cohorts_with_variants: cohortsWithVariants,
        courses_with_variants: coursesWithVariants,
        payment_id: stripe_checkout_session_id
      });

      
      console.log(
        `Processing enrollment for ${email}, total payment: ${total_price_paid} ${currency}`
      );
      console.log(`Courses bought: ${course_ids.join(", ")}`);
      console.log(`Variants bought: ${cohort_ids.join(", ")}`);
      console.log(`Variants bought: ${course_variant_ids.join(", ")}`);
      console.log(`Variants bought: ${cohort_variant_ids.join(", ")}`);
      console.log(`Email result for ${email}:`, emailResult);

      // Mark as sent
      await supabaseAdmin.from("session_email_queue").update({ email_sent: true }).eq("id", id);

      return new Response(JSON.stringify({ message: "Activation email processed", emailResult }), { headers: { "Content-Type": "application/json" }, status: 200});

    } else {
      console.log(
        `Unhandled webhook event: table=${table}, type=${type}, status=${record?.email_sent}`
      );
    return new Response(JSON.stringify({ message: "Event not handled" }), { headers: { "Content-Type": "application/json" }, status: 200 });
    }
  } catch (err: any) {
    console.error("Error in session_email_queue trigger:", err);
    return new Response(JSON.stringify({ error: err.message }), { headers: { "Content-Type": "application/json" }, status: 500 });
  }
});