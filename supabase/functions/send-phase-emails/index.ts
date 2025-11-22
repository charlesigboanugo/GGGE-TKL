// cron job

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// --- IMPORTANT: Access environment variables using Deno.env.get() ---
// These values MUST be set as Supabase Secrets in your dashboard.
const SENDER_EMAIL =
  Deno.env.get("VITE_FROM_ADDRESS") || "hello@givegetgoeducation.co.uk";
const SENDER_NAME = Deno.env.get("VITE_APP_NAME") || "GGGE-Learning";
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

// Initialize Supabase client with the service_role key
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// --- Helper function to send email via Brevo API (re-used) ---
async function sendBrevoTemplateEmail(
  toEmail: string,
  templateId: number,
  params: Record<string, any>
) {
  if (!BREVO_API_KEY) {
    console.error(
      "BREVO_API_KEY is not set in Supabase Secrets. Cannot send email."
    );
    return { success: false, message: "API key missing" };
  }

  if (isNaN(templateId) || templateId <= 0) {
    console.error(
      `Invalid templateId provided: ${templateId}. Cannot send email.`
    );
    return { success: false, message: "Invalid template ID" };
  }

  console.log(`\n--- Attempting to send Brevo template email ---`);
  console.log(`To: ${toEmail}`);
  console.log(`Template ID: ${templateId}`);
  console.log(`Parameters: ${JSON.stringify(params, null, 2)}`);
  console.log(`Sender: ${SENDER_NAME} <${SENDER_EMAIL}>`);
  console.log(`--- END PRE-SEND LOG ---\n`);

  const brevoApiUrl = "https://api.brevo.com/v3/smtp/email";

  try {
    const response = await fetch(brevoApiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email: toEmail }],
        templateId: templateId,
        params: params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `Brevo API Error: ${response.status} - ${JSON.stringify(errorData)}`
      );
      return { success: false, message: `Brevo API error: ${response.status}` };
    }

    console.log(
      `Brevo template email (ID: ${templateId}) sent successfully to ${toEmail}`
    );
    return { success: true, message: "Email sent" };
  } catch (error) {
    console.error("Error sending email via Brevo:", error);
    return { success: false, message: `Network error: ${error.message}` };
  }
}

// Helper to get user's email and username from profiles
async function getEmailAndUsernameFromProfiles(
  userId: string
): Promise<{ email: string | null; username: string | null }> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("email, username")
    .eq("id", userId)
    .single();
  if (error && error.code !== "PGRST116") {
    // PGRST116 is "No rows found" which is fine
    console.error("Error fetching profile:", error);
    return { email: null, username: null };
  }
  return {
    email: data?.email || null,
    username: data?.username || null,
  };
}

// --- Main Launch Phase Management and Email Job Function ---
async function runLaunchPhaseManagerJob() {
  console.log(
    `--- Running Launch Phase Manager Job at ${new Date().toISOString()} ---`
  );
  const now = new Date(); // Current time on the server

  // 1. Fetch all phases ordered by start time
  const { data: phases, error: fetchError } = await supabaseAdmin
    .from("course_phases")
    .select("*")
    .order("starts_at", { ascending: true });

  if (fetchError) {
    console.error("Error fetching course_phases:", fetchError);
    return;
  }

  if (!phases || phases.length === 0) {
    console.log("No course phases defined.");
    return;
  }

  let currentActivePhaseId: number | null = null;
  let phaseToActivate: any | null = null;
  let phaseToDeactivate: any | null = null;

  // Determine the current active phase and any transitions
  for (const phase of phases) {
    const startsAt = new Date(phase.starts_at);
    const endsAt = phase.ends_at ? new Date(phase.ends_at) : null;

    // Check if this phase should be active now
    const shouldBeActive = now >= startsAt && (!endsAt || now < endsAt);

    if (shouldBeActive) {
      currentActivePhaseId = phase.id;
      if (!phase.is_active) {
        // This phase should be active but isn't marked as such
        phaseToActivate = phase;
      }
    } else if (phase.is_active && now >= (endsAt || new Date(0))) {
      // If it was active but should no longer be
      phaseToDeactivate = phase;
    }
  }

  // Handle phase deactivation (if a phase just ended)
  if (phaseToDeactivate) {
    console.log(`Deactivating phase: ${phaseToDeactivate.phase_name}`);
    const { error: updateError } = await supabaseAdmin
      .from("course_phases")
      .update({ is_active: false })
      .eq("id", phaseToDeactivate.id);
    if (updateError) {
      console.error(
        `Error deactivating phase ${phaseToDeactivate.id}:`,
        updateError
      );
    }
  }

  // Handle phase activation (if a new phase just started)
  if (phaseToActivate) {
    console.log(`Activating phase: ${phaseToActivate.phase_name}`);
    const { error: updateError } = await supabaseAdmin
      .from("course_phases")
      .update({ is_active: true })
      .eq("id", phaseToActivate.id);
    if (updateError) {
      console.error(
        `Error activating phase ${phaseToActivate.id}:`,
        updateError
      );
    }

    // Send email for the newly active phase if not already sent
    if (
      !phaseToActivate.email_sent_for_phase &&
      phaseToActivate.email_template_id
    ) {
      console.log(
        `Sending broadcast email for newly active phase: ${phaseToActivate.phase_name}`
      );

      const { data: users, error: usersError } = await supabaseAdmin
        .from("profiles")
        .select("id, email");

      if (usersError) {
        console.error(
          "Error fetching all users for phase update email:",
          usersError
        );
        return;
      }

      if (!users || users.length === 0) {
        console.log("No users found to send phase update emails to.");
      } else {
        const sendPromises = users.map(async (user) => {
          if (user.email) {
            const profile = await getEmailAndUsernameFromProfiles(user.id);
            const username =
              profile?.username || user.email.split("@")[0] || "Learner";
            const params = {
              username: username,
              phase_name: phaseToActivate.phase_name,
              // Add other dynamic parameters your templates need
            };
            return sendBrevoTemplateEmail(
              user.email,
              phaseToActivate.email_template_id,
              params
            );
          }
          return Promise.resolve({
            success: false,
            message: "No email for user",
          });
        });

        const results = await Promise.all(sendPromises);
        const successfulSends = results.filter((r) => r.success).length;
        console.log(
          `Sent ${successfulSends} phase update emails for ${phaseToActivate.phase_name}.`
        );

        // Mark email as sent for this phase
        const { error: markSentError } = await supabaseAdmin
          .from("course_phases")
          .update({ email_sent_for_phase: true })
          .eq("id", phaseToActivate.id);
        if (markSentError) {
          console.error(
            `Error marking email sent for phase ${phaseToActivate.id}:`,
            markSentError
          );
        } else {
          console.log(
            `Successfully marked email sent for phase ${phaseToActivate.phase_name}.`
          );
        }
      }
    } else if (phaseToActivate.email_sent_for_phase) {
      console.log(
        `Email for phase ${phaseToActivate.phase_name} already sent.`
      );
    }
  }

  console.log(`--- Launch Phase Manager Job Finished ---`);
}

// --- Main Edge Function Handler (for Supabase Scheduler) ---
serve(async (req) => {
  try {
    console.log("Scheduled launch phase management function triggered.");
    await runLaunchPhaseManagerJob();

    return new Response(
      JSON.stringify({
        message: "Scheduled launch phase management job completed.",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Error in scheduled launch phase management function:",
      error
    );
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
