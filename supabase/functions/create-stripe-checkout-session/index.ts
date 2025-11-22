import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
import Stripe from "https://esm.sh/stripe@12.18.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2022-11-15",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const STRIPE_MEMBERSHIP_PRICE_ID = Deno.env.get("STRIPE_MEMBERSHIP_PRICE_ID");

if (!Deno.env.get("STRIPE_SECRET_KEY"))
  throw new Error("Missing STRIPE_SECRET_KEY");
if (!Deno.env.get("SUPABASE_URL") || !Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))
  throw new Error("Missing Supabase URL or service role key");
if (!STRIPE_MEMBERSHIP_PRICE_ID)
  throw new Error("Missing STRIPE_MEMBERSHIP_PRICE_ID");

serve(async (req: Request) => {
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(JSON.stringify({ error: "Missing auth header" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error(
        `Authentication error: ${authError?.message || "No user found"}`
      );
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const body = await req.json();
    const {
      paymentType,
      successUrl,
      cancelUrl,
      cartItems,
      launchPhase,
      totalPrice,
      currency,
    } = body;

    console.log(`Request body: ${JSON.stringify(body, null, 2)}`);
    console.log(
      `Authenticated user: ${JSON.stringify(
        { id: user.id, email: user.email },
        null,
        2
      )}`
    );

    if (!paymentType || !successUrl || !cancelUrl) {
      console.error(
        "Missing required parameters: paymentType, successUrl, or cancelUrl"
      );
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    let session;
    if (paymentType === "subscription") {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: STRIPE_MEMBERSHIP_PRICE_ID, quantity: 1 }],
        customer_email: user.email,
        client_reference_id: user.id,
        metadata: {
          userId: user.id,
          userEmail: user.email,
          paymentType: "subscription",
          no_balance: "true",
          timestamp: new Date().toISOString(),
        },
        subscription_data: {
          metadata: {
            userId: user.id,
            userEmail: user.email,
            paymentType: "subscription",
            no_balance: "true",
            timestamp: new Date().toISOString(),
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    } else if (paymentType === "one_time") {
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        console.error("Invalid cartItems for one-time payment");
        return new Response(JSON.stringify({ error: "Invalid cartItems" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const validatedPrice = Math.round(Number(totalPrice) * 100);
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency || "gbp",
              product_data: {
                name:
                  cartItems.length === 3 && launchPhase === "phase1"
                    ? "3-Course Bundle"
                    : `Course Bundle (${cartItems.length} courses)`,
                description: cartItems.map((i: any) => i.courseName).join(", "),
                metadata: {
                  cartItems: JSON.stringify(cartItems),
                  launchPhase,
                },
              },
              unit_amount: validatedPrice,
            },
            quantity: 1,
          },
        ],
        customer_email: user.email,
        client_reference_id: user.id,
        metadata: {
          userId: user.id,
          userEmail: user.email,
          paymentType: "one_time",
          launchPhase,
          totalPrice: totalPrice.toString(),
          currency: currency || "gbp",
          cartItems: JSON.stringify(cartItems),
          timestamp: new Date().toISOString(),
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    } else {
      console.error(`Invalid paymentType: ${paymentType}`);
      return new Response(
        JSON.stringify({ error: `Invalid paymentType: ${paymentType}` }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.log(`Created Stripe checkout session: ${session.id}`);
    return new Response(
      JSON.stringify({
        sessionId: session.url,
        stripeSessionId: session.id,
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error(`Error creating checkout session: ${error.message}`);
    return new Response(
      JSON.stringify({
        error: `Failed to create checkout session: ${error.message}`,
        success: false,
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
