// Purpose:
// Handle Stripe webhook events (e.g., checkout.session.completed, customer.subscription.created/updated/deleted, invoice.payment_succeeded).
// For one-time payments, insert a single enrollment record with course_ids and variant_ids as arrays.
// For subscriptions, upsert or delete user_subscriptions records.

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

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

if (!Deno.env.get("STRIPE_SECRET_KEY"))
  throw new Error("Missing STRIPE_SECRET_KEY");
if (!endpointSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
if (!Deno.env.get("SUPABASE_URL") || !Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))
  throw new Error("Missing Supabase URL or service role key");

async function upsertSubscription(
  userId,
  email,
  customerId,
  subscriptionId,
  subscription,
  metadata
) {
  try {
    const { error: upsertError } = await supabaseAdmin
      .from("user_subscriptions")
      .upsert(
        {
          user_id: userId,
          email: email,
          stripe_customer_id: customerId || "",
          stripe_subscription_id: subscriptionId,
          status: subscription.status,
          metadata: metadata || {},
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (upsertError) {
      console.error(`Database upsert failed:`, upsertError);
      throw new Error(`Database error: ${upsertError.message}`);
    }

    console.log(
      `Upserted subscription for user ${userId}, subscription ${subscriptionId}, status ${subscription.status}`
    );
  } catch (error) {
    console.error(`Error upserting subscription ${subscriptionId}:`, error);
    throw error;
  }
}

async function deleteSubscription(userId, subscriptionId) {
  try {
    const { error: deleteError } = await supabaseAdmin
      .from("user_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("stripe_subscription_id", subscriptionId);

    if (deleteError) {
      console.error(`Database delete failed:`, deleteError);
      throw new Error(`Database error: ${deleteError.message}`);
    }

    console.log(`Deleted subscription ${subscriptionId} for user ${userId}`);
  } catch (error) {
    console.error(`Error deleting subscription ${subscriptionId}:`, error);
    throw error;
  }
}

async function handleWebhook(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!sig) {
    console.error("Missing stripe-signature header");
    return new Response(JSON.stringify({ error: "Missing stripe-signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      endpointSecret
    );
    console.log(`Received Stripe event: ${event.type}`);
    console.log(
      `Event metadata: ${JSON.stringify(event.data.object.metadata, null, 2)}`
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log(`Session details: ${JSON.stringify(session, null, 2)}`);
    const userId = session.metadata?.userId || session.client_reference_id;
    const email = session.customer_email || session.customer_details?.email;
    const subscriptionId = session.subscription;
    const customerId = session.customer;
    const paymentType = session.metadata?.paymentType;

    if (!userId || !email || !paymentType) {
      console.error(
        `Missing userId, email, or paymentType in session: ${JSON.stringify(
          session,
          null,
          2
        )}`
      );
      return new Response(
        JSON.stringify({ error: "Missing userId, email, or paymentType" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (paymentType === "one_time") {
      const cartItems = JSON.parse(session.metadata?.cartItems || "[]");
      const transactionId = session.id;
      const totalPrice = parseFloat(session.metadata?.totalPrice || "0");
      const currency = session.metadata?.currency || "gbp";

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        console.error("No valid cartItems in metadata");
        return new Response(JSON.stringify({ error: "No cart items" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Extract course_ids and variant_ids into separate arrays
      const courseIds = cartItems.map((item) => item.courseId);
      const variantIds = cartItems.map((item) => item.variantId);

      try {
        const { error } = await supabaseAdmin.from("enrollments").insert({
          user_id: userId,
          email: email,
          stripe_checkout_session_id: transactionId,
          course_ids: courseIds,
          variant_ids: variantIds,
          total_price_paid: totalPrice,
          currency: currency,
          status: "completed",
        });

        if (error) {
          console.error(
            `Error inserting enrollment for user ${userId}:`,
            error
          );
        } else {
          console.log(
            `Inserted single enrollment record for user ${userId} with transaction ${transactionId}`
          );
        }
      } catch (err) {
        console.error(
          `Caught error during enrollment insertion for transaction ${transactionId}:`,
          err
        );
      }
    } else if (paymentType === "subscription" && subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        if (!subscription) {
          console.error(
            `Error fetching subscription ${subscriptionId}: No subscription returned`
          );
          return new Response(
            JSON.stringify({
              error: `Failed to fetch subscription ${subscriptionId}`,
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        await upsertSubscription(
          userId,
          email,
          customerId,
          subscriptionId,
          subscription,
          session.metadata
        );
      } catch (error) {
        console.error(`Error processing ${event.type}:`, error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      console.log(
        `No subscriptionId for one-time payment or invalid paymentType, skipping subscription upsert`
      );
    }
  } else if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created"
  ) {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;
    const customerId = subscription.customer;
    const metadata = subscription.metadata;

    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer) {
        console.error(
          `Error fetching customer ${customerId}: No customer returned`
        );
        return new Response(
          JSON.stringify({ error: `Failed to fetch customer ${customerId}` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const userId = metadata?.userId;
      const email = customer.email;
      if (!userId || !email) {
        console.error(
          `Missing userId or email in subscription ${subscriptionId}: ${JSON.stringify(
            subscription,
            null,
            2
          )}`
        );
        return new Response(
          JSON.stringify({ error: "Missing userId or email" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      await upsertSubscription(
        userId,
        email,
        customerId,
        subscriptionId,
        subscription,
        metadata
      );
    } catch (error) {
      console.error(`Error processing ${event.type}:`, error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) {
      console.log(`No subscriptionId in invoice.payment_succeeded, skipping`);
      return new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (!subscription) {
        console.error(
          `Error fetching subscription ${subscriptionId}: No subscription returned`
        );
        return new Response(
          JSON.stringify({
            error: `Failed to fetch subscription ${subscriptionId}`,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const customerId = subscription.customer;
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer) {
        console.error(
          `Error fetching customer ${customerId}: No customer returned`
        );
        return new Response(
          JSON.stringify({ error: `Failed to fetch customer ${customerId}` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const userId = subscription.metadata?.userId;
      const email = customer.email;
      if (!userId || !email) {
        console.error(
          `Missing userId or email in subscription ${subscriptionId}: ${JSON.stringify(
            subscription,
            null,
            2
          )}`
        );
        return new Response(
          JSON.stringify({ error: "Missing userId or email" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      await upsertSubscription(
        userId,
        email,
        customerId,
        subscriptionId,
        subscription,
        subscription.metadata
      );
    } catch (error) {
      console.error(`Error processing ${event.type}:`, error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;
    const customerId = subscription.customer;
    const metadata = subscription.metadata;

    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer) {
        console.error(
          `Error fetching customer ${customerId}: No customer returned`
        );
        return new Response(
          JSON.stringify({ error: `Failed to fetch customer ${customerId}` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const userId = metadata?.userId;
      const email = customer.email;
      if (!userId || !email) {
        console.error(
          `Missing userId or email in subscription ${subscriptionId}: ${JSON.stringify(
            subscription,
            null,
            2
          )}`
        );
        return new Response(
          JSON.stringify({ error: "Missing userId or email" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      await deleteSubscription(userId, subscriptionId);
    } catch (error) {
      console.error(`Error processing ${event.type}:`, error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ status: "success" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  try {
    console.log(`Webhook triggered at ${new Date().toISOString()}`);
    return await handleWebhook(req);
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
