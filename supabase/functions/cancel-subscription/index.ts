// Purpose:
// Handle user-initiated subscription cancellation by querying 'user_subscriptions' for the 'stripe_subscription_id'
// and calling Stripe's API to cancel it. Triggers 'customer.subscription.deleted' event to stripe-webhook,
// which deletes the user_subscriptions row, and 'subscriptions-webhook-handler' handles Brevo list updates and email.

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
if (!Deno.env.get("STRIPE_SECRET_KEY")) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}
if (
  !Deno.env.get("SUPABASE_URL") ||
  !Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
) {
  throw new Error("Missing Supabase URL or service role key");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    console.error(`Invalid method: ${req.method}`);
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    // Check for valid JSON body
    let body;
    const rawBody = await req.text();
    console.log(`Raw request body: ${rawBody}`);

    if (!rawBody) {
      console.error("Empty request body");
      return new Response(JSON.stringify({ error: "Empty request body" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const { userId } = body;
    if (!userId) {
      console.error("Missing userId in request body");
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Query user_subscriptions for active or trialing subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .single();

    if (subError || !subscription?.stripe_subscription_id) {
      console.error(
        `No active subscription for user ${userId}:`,
        subError?.message || "No subscription found"
      );
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Cancel subscription via Stripe API
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    console.log(
      `Cancelled subscription ${subscription.stripe_subscription_id} for user ${userId}`
    );

    return new Response(JSON.stringify({ message: "Subscription cancelled" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Error cancelling subscription:", err);
    return new Response(
      JSON.stringify({
        error: `Failed to cancel subscription: ${err.message}`,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
