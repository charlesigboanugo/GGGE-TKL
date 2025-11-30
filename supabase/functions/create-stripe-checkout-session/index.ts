import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import Stripe from "https://esm.sh/stripe@12.18.0";


// --- NEW: ORDER HELPERS ---
async function createOrder(user, cartItems, total_price, currency, paymentType) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: user.id,
      cart_items: cartItems,
      total_price: total_price,
      currency,
      payment_type: paymentType,
      status: "pending"
    })
    .select("id")
    .single();

  if (error) throw new Error("Failed to create order");

  return data.id; // DB autogenerates UUID
}

async function attachSessionToOrder(orderId, sessionId) {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ stripe_checkout_session_id: sessionId })
    .eq("id", orderId);

  if (error) throw new Error("Failed to update order with session");
}


// --- ENV ---
const BASE_URL = Deno.env.get("VITE_PUBLIC_REDIRECT_URL") || "http://127.0.0.1:5173";
const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const STRIPE_MEMBERSHIP_PRICE_ID = Deno.env.get("STRIPE_MEMBERSHIP_PRICE_ID") || "Price_123";

const SUCCESS_URL = `${BASE_URL}/payment-success`;
const CANCEL_URL = `${BASE_URL}/payment-failed`;
const CURRENCY = "gbp";

if (!STRIPE_SECRET) throw new Error("Missing STRIPE_SECRET_KEY");
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing Supabase config");

console.log(STRIPE_SECRET);
console.log(SUPABASE_URL);
console.log(STRIPE_MEMBERSHIP_PRICE_ID);

// --- Stripe & Supabase ---
const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2022-11-15" });
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  try {
    // --- Auth ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth header" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (!user || authError) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    console.log("great");

    const { paymentType, cartItems } = await req.json();

    // --- Validate Cohort Selection Rules ---
    if (paymentType === "one_time") {
      const cohortItems = cartItems.filter(i => i.type === "cohort");

      if (cohortItems.length > 0) {
        const hasFullProgram = cohortItems.some(i => i.variantId === "full_program");
        const hasNormalCohorts = cohortItems.some(i => i.variantId !== "full_program");

        if (hasFullProgram && hasNormalCohorts) {
          return new Response(JSON.stringify({
            error: "Invalid cohort selection: You cannot mix Full Program with individual cohorts."
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      }
    }

    if (!paymentType || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.log("cartlength:", cartItems.length);

      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // --- Get current global phase ---
    const { data: phaseData, error: phaseErr } = await supabaseAdmin
      .from("global_phases")
      .select("phase_name, starts_at")
      .order("starts_at", { ascending: false });

    if (phaseErr) console.log(phaseErr);

    const now = Date.now();
    let activePhase: string | null = null;

    for (const phase of phaseData || []) {
      const start = new Date(phase.starts_at).getTime();
      if (now >= start) {
        activePhase = phase.phase_name;
        break;
      }
    }

    if (!activePhase) activePhase = "before_launch";

    if (["before_launch", "closed"].includes(activePhase) && paymentType === "one_time") {
      return new Response(JSON.stringify({
        error: `Checkout not allowed during ${activePhase}`
      }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const timestamp = new Date().toISOString();
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let total_price = 0;

    // ---------------- SUBSCRIPTION ----------------
    if (paymentType === "subscription") {
      lineItems.push({ price: STRIPE_MEMBERSHIP_PRICE_ID, quantity: 1 });
    }

    // ---------------- ONE-TIME PURCHASES ----------------
    else if (paymentType === "one_time") {

      const courseIds = cartItems.filter(i => i.type === "course").map(i => i.variantId);
      const cohortIds = cartItems.filter(i => i.type === "cohort").map(i => i.variantId);

      const [cohortVar, courseVar] = await Promise.all([
        cohortIds.length
          ? supabaseAdmin.from("cohort_variants").select("*").in("id", cohortIds)
          : Promise.resolve({ data: [] }),

        courseIds.length
          ? supabaseAdmin.from("course_variants").select("*").in("id", courseIds)
          : Promise.resolve({ data: [] }),
      ]);

      const courseMap = new Map(courseVar.data?.map(v => [v.id, v]));
      const cohortMap = new Map(cohortVar.data?.map(v => [v.id, v]));

      for (const item of cartItems) {
        const variant = item.type === "course" ? courseMap.get(item.variantId) : cohortMap.get(item.variantId);
        if (!variant) {
          return new Response(JSON.stringify({ error: "Invalid variant" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }

        const price = activePhase === "phase_1" ? variant.price_phase1 : variant.price_phase2;
        total_price += price;

        lineItems.push({
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: `${item.name} - ${variant.name}`,
              description: `${item.name} - ${variant.name} (${activePhase})`,
              metadata: {
                parentId: item.type === "course" ? item.courseId : item.cohortId,
                variantId: item.variantId,
                type: item.type,
                phase: activePhase,
                timestamp
              },
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Invalid payment type" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // CREATE ORDER BEFORE STRIPE SESSION
    const orderId = await createOrder(user, cartItems, total_price, CURRENCY, paymentType);

    const baseMetadata = { userId: user.id, userEmail: user.email ?? "", paymentType, timestamp, orderId };
    const sessionMetadata =
      paymentType === "subscription"
        ? { ...baseMetadata, no_balance: "true" }
        : { ...baseMetadata, phase: activePhase, currency: CURRENCY /*, cartItems: JSON.stringify(cartItems) */ };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: paymentType === "subscription" ? "subscription" : "payment",
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: lineItems,
      success_url: SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: CANCEL_URL,
      metadata: sessionMetadata,
    };

    if (paymentType === "subscription") {
      sessionParams.subscription_data = {
        metadata: { userId: user.id, userEmail: user.email ?? "", paymentType: "subscription", no_balance: "true", timestamp, orderId }
      };
    }

    if (paymentType === "one_time") {
      sessionParams.payment_intent_data = {
        metadata: { ...sessionMetadata }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // ATTACH STRIPE SESSION ID TO ORDER
    await attachSessionToOrder(orderId, session.id);

    console.log("session:", session.url);

    return new Response(JSON.stringify({
      success: true,
      sessionUrl: session.url,
      orderId: orderId,
      sessionId: session.id,
      phase: activePhase
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("Checkout error:", error);

    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});