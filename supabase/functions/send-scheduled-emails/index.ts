// Purpose:
// Send "Day 2 to Day 5" emails to users based on their enrollment created_at timestamp.
// Ensures emails are sent only once per user for each day's sequence.
// Marks dayX_email_sent_at on the public.profiles table.
// Trigger:
// Cron job (e.g., daily or every minute for testing)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Load environment variables
const DAY2_EMAIL_TEMPLATE_ID = parseInt(
  Deno.env.get("VITE_DAY2_EMAIL_TEMPLATE_ID") || "2"
);
const DAY3_EMAIL_TEMPLATE_ID = parseInt(
  Deno.env.get("VITE_DAY3_EMAIL_TEMPLATE_ID") || "3"
);
const DAY4_EMAIL_TEMPLATE_ID = parseInt(
  Deno.env.get("VITE_DAY4_EMAIL_TEMPLATE_ID") || "4"
);
const DAY5_EMAIL_TEMPLATE_ID = parseInt(
  Deno.env.get("VITE_DAY5_EMAIL_TEMPLATE_ID") || "5"
);
const SENDER_EMAIL =
  Deno.env.get("VITE_FROM_ADDRESS") || "hello@givegetgoeducation.co.uk";
const SENDER_NAME = Deno.env.get("VITE_APP_NAME") || "GGGE Learning";
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const REDIRECT_URL_BASE =
  Deno.env.get("VITE_PUBLIC_REDIRECT_URL") || "http://localhost:5173/";

// Validate critical env vars
if (!BREVO_API_KEY)
  throw new Error("Missing BREVO_API_KEY in Supabase Secrets");
if (!Deno.env.get("SUPABASE_URL") || !Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))
  throw new Error("Missing Supabase URL or service role key");
if (!Deno.env.get("VITE_PUBLIC_REDIRECT_URL")) {
  console.warn(
    "VITE_PUBLIC_REDIRECT_URL not set, using default: https://yourapp.com"
  );
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function sendBrevoTemplateEmail(
  toEmail: string,
  templateId: number,
  params: Record<string, any>,
  retries = 2
) {
  if (isNaN(templateId) || templateId <= 0) {
    console.error(`Invalid templateId: ${templateId}`);
    throw new Error("Invalid template ID");
  }

  console.log(`Sending email to ${toEmail} with template ID ${templateId}`);
  console.log(`Parameters: ${JSON.stringify(params, null, 2)}`);

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
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
        console.error(
          `Brevo API error (attempt ${attempt}): ${
            response.status
          } - ${JSON.stringify(errorData)}`
        );
        if (attempt > retries) {
          throw new Error(
            `Brevo API error: ${response.status} - ${errorData.message}`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      console.log(`Email sent to ${toEmail} (template ID: ${templateId})`);
      return { success: true, message: "Email sent" };
    } catch (error: any) {
      console.error(`Network error sending email (attempt ${attempt}):`, error);
      if (attempt > retries) {
        throw new Error(
          `Network error after ${retries} retries: ${error.message}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error("Failed to send email after retries");
}

async function runScheduledEmailJob() {
  console.log(`Running Scheduled Email Job at ${new Date().toISOString()}`);
  console.log(
    `Env vars: BREVO_API_KEY=${
      BREVO_API_KEY ? "set" : "unset"
    }, REDIRECT_URL_BASE=${REDIRECT_URL_BASE}`
  );

  const TEST_MODE_MINUTES = true; // Toggle to false for production
  const now = new Date();

  for (let dayOffset = 1; dayOffset <= 4; dayOffset++) {
    let queryIntervalStart: Date;
    let queryIntervalEnd: Date;

    if (TEST_MODE_MINUTES) {
      const targetTime = new Date(now.getTime());
      targetTime.setUTCMinutes(now.getUTCMinutes() - dayOffset);
      queryIntervalStart = new Date(targetTime.getTime() - 60 * 1000); // ±1 minute
      queryIntervalEnd = new Date(targetTime.getTime() + 60 * 1000);
    } else {
      const targetDay = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() - dayOffset
        )
      );
      queryIntervalStart = new Date(
        Date.UTC(
          targetDay.getUTCFullYear(),
          targetDay.getUTCMonth(),
          targetDay.getUTCDate(),
          0,
          0,
          0
        )
      );
      queryIntervalEnd = new Date(
        Date.UTC(
          targetDay.getUTCFullYear(),
          targetDay.getUTCMonth(),
          targetDay.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
    }

    console.log(
      `Checking Day ${dayOffset + 1} email (${dayOffset} ${
        TEST_MODE_MINUTES ? "minute(s)" : "day(s)"
      } ago)`
    );
    console.log(
      `Time window: ${queryIntervalStart.toISOString()} to ${queryIntervalEnd.toISOString()}`
    );

    const emailSentColumn = `day${dayOffset + 1}_email_sent_at`;

    // Fetch distinct user_ids from enrollments
    const { data: enrollmentUsers, error: enrollmentError } =
      await supabaseAdmin
        .from("enrollments")
        .select("user_id")
        .eq("status", "completed")
        .gte("created_at", queryIntervalStart.toISOString())
        .lt("created_at", queryIntervalEnd.toISOString());

    if (enrollmentError) {
      console.error(
        `Error fetching enrollments for Day ${dayOffset + 1}:`,
        enrollmentError
      );
      continue;
    }

    // Deduplicate user_ids
    const uniqueUserIds = [
      ...new Set(enrollmentUsers?.map((e) => e.user_id) || []),
    ];
    console.log(
      `Debug: Unique user_ids in enrollments: ${JSON.stringify(uniqueUserIds)}`
    );

    if (!uniqueUserIds.length) {
      console.log(`No enrollments found for Day ${dayOffset + 1} email.`);
      continue;
    }

    // Fetch profiles for these users
    const { data: usersToEmail, error: usersToEmailError } = await supabaseAdmin
      .from("profiles")
      .select(`id, email, username, ${emailSentColumn}`)
      .is(emailSentColumn, null)
      .in("id", uniqueUserIds);

    if (usersToEmailError) {
      console.error(
        `Error fetching users for Day ${dayOffset + 1}:`,
        usersToEmailError
      );
      continue;
    }

    if (!usersToEmail || usersToEmail.length === 0) {
      console.log(`No eligible users found for Day ${dayOffset + 1} email.`);
      continue;
    }

    console.log(
      `Found ${usersToEmail.length} user(s) for Day ${dayOffset + 1} email`
    );

    for (const userProfile of usersToEmail) {
      if (!userProfile.email) {
        console.error(`No email for user_id: ${userProfile.id}, skipping`);
        continue;
      }

      const username =
        userProfile.username || userProfile.email.split("@")[0] || "Learner";
      let templateId: number | undefined;
      let templateParams: Record<string, any> = { username };

      switch (dayOffset) {
        case 1:
          templateId = DAY2_EMAIL_TEMPLATE_ID;
          templateParams.link_to_resource = `${REDIRECT_URL_BASE}/resources/day2`;
          break;
        case 2:
          templateId = DAY3_EMAIL_TEMPLATE_ID;
          templateParams.link_to_resource = `${REDIRECT_URL_BASE}/resources/day3`;
          break;
        case 3:
          templateId = DAY4_EMAIL_TEMPLATE_ID;
          templateParams.link_to_resource = `${REDIRECT_URL_BASE}/resources/day4`;
          break;
        case 4:
          templateId = DAY5_EMAIL_TEMPLATE_ID;
          templateParams.link_to_resource = `${REDIRECT_URL_BASE}/resources/day5`;
          templateParams.price = "£35";
          break;
        default:
          console.warn(`No template for dayOffset: ${dayOffset}`);
          continue;
      }

      if (templateId) {
        try {
          const sendResult = await sendBrevoTemplateEmail(
            userProfile.email,
            templateId,
            templateParams
          );
          if (sendResult.success) {
            const { error: updateError } = await supabaseAdmin
              .from("profiles")
              .update({ [emailSentColumn]: new Date().toISOString() })
              .eq("id", userProfile.id);
            if (updateError) {
              console.error(
                `Error marking Day ${dayOffset + 1} email sent for ${
                  userProfile.id
                }:`,
                updateError
              );
            } else {
              console.log(
                `Marked Day ${dayOffset + 1} email sent for ${userProfile.id}`
              );
            }
          } else {
            console.error(
              `Failed to send Day ${dayOffset + 1} email to ${
                userProfile.email
              }: ${sendResult.message}`
            );
          }
        } catch (error: any) {
          console.error(
            `Error processing Day ${dayOffset + 1} email for ${
              userProfile.id
            }:`,
            error
          );
        }
      } else {
        console.warn(
          `Skipping email for user ${userProfile.id}: Missing template ID`
        );
      }
    }
  }

  console.log(`Scheduled Email Job Finished`);
}

serve(async (req) => {
  try {
    console.log(`Cron triggered at ${new Date().toISOString()}`);
    await runScheduledEmailJob();
    return new Response(
      JSON.stringify({ message: "Scheduled email job completed" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in scheduled email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
