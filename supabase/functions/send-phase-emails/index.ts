// launch-phase-manager.ts
// Edge Function (Deno) — Launch Phase Manager
//
// Behavior:
//  - Uses only `starts_at` to determine phase activation.
//  - Sorts phases descending by starts_at so the first phase is the latest.
//  - Finds the first phase where starts_at <= now and makes it active.
//  - Deactivates all other phases.
//  - When a phase becomes active, sends a broadcast email to all users **once**.
//  - Uses Brevo (smtp/email endpoint) to send templates, with robust logging & error handling.
//
// Required Supabase Secrets:
//  - SUPABASE_URL
//  - SUPABASE_SERVICE_ROLE_KEY
//  - BREVO_API_KEY
//  - VITE_FROM_ADDRESS (optional default)
//  - VITE_APP_NAME (optional default)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Env / config
const SENDER_EMAIL =
  Deno.env.get("VITE_FROM_ADDRESS") || "";
const SENDER_NAME = Deno.env.get("VITE_APP_NAME") || "TKOC Learning";
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

if (!Deno.env.get("SUPABASE_URL") || !Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// -------------------------
// Brevo helper (robust)
// -------------------------
async function sendBrevoTemplateEmail(
  toEmail: string,
  templateId: number,
  params: Record<string, any>
): Promise<{ success: boolean; message: string }> {
  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY is not set in Supabase Secrets. Cannot send email.");
    return { success: false, message: "API key missing" };
  }
  if (!toEmail) {
    console.error("No toEmail provided to sendBrevoTemplateEmail.");
    return { success: false, message: "No recipient email" };
  }
  if (isNaN(templateId) || templateId <= 0) {
    console.error(`Invalid templateId provided: ${templateId}. Cannot send email.`);
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
    const res = await fetch(brevoApiUrl, {
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

    if (!res.ok) {
      // try to parse error body
      let errBody = null;
      try {
        errBody = await res.json();
      } catch (e) {
        errBody = `Unable to parse error body: ${e?.message || e}`;
      }
      console.error(`Brevo API Error: ${res.status} - ${JSON.stringify(errBody)}`);
      return { success: false, message: `Brevo API error: ${res.status}` };
    }

    console.log(`Brevo template email (ID: ${templateId}) sent successfully to ${toEmail}`);
    return { success: true, message: "Email sent" };
  } catch (error) {
    console.error("Error sending email via Brevo:", error);
    return { success: false, message: `Network error: ${error?.message || String(error)}` };
  }
}

// -------------------------
// Profiles helper
// -------------------------
async function getEmailAndUsernameFromProfiles(
  userId: string
): Promise<{ email: string | null; username: string | null }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("email, username")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(`Error fetching profile for user ${userId}:`, error);
      return { email: null, username: null };
    }

    return {
      email: data?.email || null,
      username: data?.username || null,
    };
  } catch (err) {
    console.error("Unexpected error fetching profile:", err);
    return { email: null, username: null };
  }
}

// -------------------------
// Broadcast helper
// -------------------------
async function sendPhaseEmailToAllUsers(phaseRecord: any) {
  if (!phaseRecord || !phaseRecord.email_template_id) {
    console.log("Phase record missing or has no email_template_id, skipping broadcast.");
    return { successCount: 0, total: 0, error: null };
  }

  console.log(`Preparing to broadcast phase email for: ${phaseRecord.phase_name}`);

  // fetch all users' id + email
  const { data: users, error: usersError } = await supabaseAdmin
    .from("profiles")
    .select("id, email");

  if (usersError) {
    console.error("Error fetching users for phase broadcast:", usersError);
    return { successCount: 0, total: 0, error: usersError };
  }

  if (!users || users.length === 0) {
    console.log("No users found to send phase update emails to.");
    return { successCount: 0, total: 0, error: null };
  }

  // Send emails in parallel but with safe mapping (we await Promise.all)
  const sendPromises = users.map(async (user: any) => {
    if (!user?.email) {
      return { success: false, message: "No email for user", userId: user?.id || null };
    }
    // get username fallback (optional; could be omitted to save calls)
    let username = null;
    try {
      const profile = await getEmailAndUsernameFromProfiles(user.id);
      username = profile.username || null;
    } catch (e) {
      console.warn(`Could not fetch username for ${user.id}`, e);
    }
    const params: Record<string, any> = {
      username: username || (user.email ? user.email.split("@")[0] : "Learner"),
      phase_name: phaseRecord.phase_name,
      // add other dynamic params here if needed
    };

    const result = await sendBrevoTemplateEmail(user.email, phaseRecord.email_template_id, params);
    return { ...result, userId: user.id };
  });

  const results = await Promise.all(sendPromises);
  const successfulSends = results.filter((r) => r && (r as any).success).length;
  console.log(`Broadcast results: ${successfulSends} / ${users.length} successful.`);
  return { successCount: successfulSends, total: users.length, error: null, details: results };
}

// -------------------------
// Main job
// -------------------------
async function runLaunchPhaseManagerJob() {
  console.log(`--- Running Launch Phase Manager Job at ${new Date().toISOString()} ---`);

  // Fetch all phases sorted DESC by starts_at (highest/most recent first)
  const { data: phases, error: fetchError } = await supabaseAdmin
    .from("global_phases")
    .select("*")
    .order("starts_at", { ascending: false }); // 🔥 DESCENDING sort as requested

  if (fetchError) {
    console.error("Error fetching course_phases:", fetchError);
    return;
  }
  if (!phases || phases.length === 0) {
    console.log("No course phases defined.");
    return;
  }

  // Find first phase in descending list whose starts_at <= now
  const now = new Date();
  let activePhase: any | null = null;
  for (const phase of phases) {
    if (!phase?.starts_at) continue;
    const startsAt = new Date(phase.starts_at);
    if (startsAt <= now) {
      activePhase = phase;
      break;
    }
  }

  if (!activePhase) {
    console.log("No active phase found (all phases are in the future). Ensuring all phases are inactive.");
    // Ensure all are inactive
    try {
      const { error: deactErr } = await supabaseAdmin
        .from("global_phases")
        .update({ is_active: false })
        .neq("is_active", false); // update only those that are not already false
      if (deactErr) {
        console.error("Error deactivating phases when no active phase found:", deactErr);
      } else {
        console.log("All phases set to is_active = false.");
      }
    } catch (err) {
      console.error("Unexpected error when deactivating phases:", err);
    }
    return;
  }

  console.log(`Identified active phase candidate: id=${activePhase.id}, name=${activePhase.phase_name}, starts_at=${activePhase.starts_at}`);

  // Transactional-ish behavior: activate the chosen phase (if needed), deactivate others
  try {
    // 1) Activate chosen phase if not active
    if (!activePhase.is_active) {
      console.log(`Activating phase id=${activePhase.id} (${activePhase.phase_name})`);
      const { error: activateError } = await supabaseAdmin
        .from("global_phases")
        .update({ is_active: true })
        .eq("id", activePhase.id);
      if (activateError) {
        console.error(`Error activating phase ${activePhase.id}:`, activateError);
      } else {
        console.log(`Phase ${activePhase.id} marked as is_active = true.`);
      }
    } else {
      console.log(`Phase ${activePhase.id} is already active.`);
    }

    // 2) Deactivate ALL other phases (set is_active = false where id != activePhase.id)
    console.log(`Deactivating other phases (all except id=${activePhase.id})`);
    const { error: deactivateError } = await supabaseAdmin
      .from("global_phases")
      .update({ is_active: false })
      .neq("id", activePhase.id);
    if (deactivateError) {
      console.error("Error deactivating other phases:", deactivateError);
    } else {
      console.log("Other phases deactivated (is_active = false).");
    }

    // 3) Send email for this phase if not already sent and template exists
    if (!activePhase.email_sent_for_phase) {
      if (activePhase.email_template_id) {
        console.log(`Phase id=${activePhase.id} email not sent yet. Initiating broadcast...`);
        const broadcastResult = await sendPhaseEmailToAllUsers(activePhase);

        if (broadcastResult && broadcastResult.successCount >= 0) {
          // mark email_sent_for_phase = true
          const { error: markError } = await supabaseAdmin
            .from("global_phases")
            .update({ email_sent_for_phase: true })
            .eq("id", activePhase.id);

          if (markError) {
            console.error(`Error marking email_sent_for_phase for ${activePhase.id}:`, markError);
          } else {
            console.log(`Marked email_sent_for_phase = true for phase ${activePhase.id}`);
          }
        } else {
          console.error("Broadcast failed or returned unexpected result:", broadcastResult);
        }
      } else {
        console.log(`Phase ${activePhase.id} has no email_template_id, skipping broadcast and marking email_sent_for_phase=false remains.`);
      }
    } else {
      console.log(`Email for phase ${activePhase.id} has already been sent (email_sent_for_phase=true).`);
    }
  } catch (err) {
    console.error("Unexpected error during phase activation/deactivation/email steps:", err);
  }

  console.log(`--- Launch Phase Manager Job Finished at ${new Date().toISOString()} ---`);
}

// Edge function handler
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
    console.error("Error in scheduled launch phase management function:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});