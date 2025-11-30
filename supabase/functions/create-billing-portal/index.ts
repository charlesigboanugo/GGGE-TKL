// Purpose:
// Create a Stripe Billing Portal session for the authenticated user.
// Users can manage their subscriptions (cancel at period end, payment methods, invoices) via the portal.
// The user is redirected back to your app after managing subscription.

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

if (!Deno.env.get("STRIPE_SECRET_KEY")) throw new Error("Missing STRIPE_SECRET_KEY");
if (!Deno.env.get("SUPABASE_URL") || !Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))
  throw new Error("Missing Supabase URL or service role key");

const BASE_URL = Deno.env.get("VITE_PUBLIC_REDIRECT_URL") || "http://localhost:5173";
const RETURN_URL = `${BASE_URL}/dashboard`; // redirect after portal exit

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
    // Extract Supabase session token from Authorization header
    const authHeader = req.headers.get("Authorization") || "";
    const tokenMatch = authHeader.match(/^Bearer (.+)$/);
    if (!tokenMatch) throw new Error("Missing or invalid Authorization header");

    const access_token = tokenMatch[1];
    const { data: { user }, error: sessionError } = await supabaseAdmin.auth.getUser(access_token);
    if (sessionError || !user?.id) throw new Error("Invalid session or user not found");

    // Query user_subscriptions to get stripe_customer_id
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due", "unpaid"])
      .single();

    if (subError || !subscription?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: "No active subscription/customer found" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Create Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: RETURN_URL,
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: any) {
    console.error("Billing Portal session error:", err);
    return new Response(
      JSON.stringify({ error: `Failed to create billing portal session: ${err.message}` }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});