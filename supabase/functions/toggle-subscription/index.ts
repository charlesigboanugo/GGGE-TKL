// Purpose:
// Handle user-initiated subscription cancellation or resumption safely by using the authenticated session.
// Cancels subscription at the period end (stop auto-renewal) or resumes it via Stripe API.
// Webhooks handle deletion and email updates.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import Stripe from "https://esm.sh/stripe@12.18.0";

// Initialize Stripe and Supabase clients
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2022-11-15",
});
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Validate environment variables
if (!Deno.env.get("STRIPE_SECRET_KEY")) throw new Error("Missing STRIPE_SECRET_KEY");
if (!Deno.env.get("SUPABASE_URL") || !Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))
  throw new Error("Missing Supabase URL or service role key");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const tokenMatch = authHeader.match(/^Bearer (.+)$/);
    if (!tokenMatch) throw new Error("Missing or invalid Authorization header");

    const access_token = tokenMatch[1];
    const {
      data: { user },
      error: sessionError,
    } = await supabaseAdmin.auth.getUser(access_token);

    if (sessionError || !user?.id) throw new Error("Invalid session or user not found");

    // Query user_subscriptions for active or trialing subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("stripe_subscription_id, cancel_at_period_end")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .single();

    if (subError || !subscription?.stripe_subscription_id) {
      return new Response(JSON.stringify({ error: "No active subscription found" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // ================= CHANGES MADE: TOGGLE cancel_at_period_end =================
    const newCancelStatus = !subscription.cancel_at_period_end;

    const updatedSub = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      { cancel_at_period_end: newCancelStatus }
    );

    const actionText = newCancelStatus ? "set to cancel at period end" : "resumed auto-renewal";

    console.log(
      `Subscription ${subscription.stripe_subscription_id} for user ${user.email} is now ${actionText}`
    );

    return new Response(
      JSON.stringify({
        message: `Subscription successfully ${actionText}`,
        cancel_at_period_end: updatedSub.cancel_at_period_end,
        current_period_end: updatedSub.current_period_end,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
    // ===============================================================
  } catch (err: any) {
    console.error("Error toggling subscription:", err);
    return new Response(
      JSON.stringify({ error: `Failed to toggle subscription: ${err.message}` }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});