// Purpose:
// delete user invoked from frontend - Improved with better logging and error handling

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  console.log(`[DELETE-USER] Received ${req.method} request`);

  // Add CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      console.log(`[DELETE-USER] Method ${req.method} not allowed`);
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get("authorization");
    console.log(`[DELETE-USER] Authorization header present: ${!!authHeader}`);

    if (!authHeader) {
      console.log("[DELETE-USER] No authorization header provided");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Extract the JWT token (remove "Bearer " prefix)
    const token = authHeader.replace("Bearer ", "");
    console.log(`[DELETE-USER] Token extracted, length: ${token.length}`);

    // Verify the JWT and get user info
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("[DELETE-USER] Error getting user from JWT:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid token or user not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    console.log(
      `[DELETE-USER] Starting account deletion for user: ${user.email} (ID: ${user.id})`
    );

    // First, delete related records from your custom tables
    try {
      console.log("[DELETE-USER] Starting custom table cleanup...");

      // Delete from profiles table
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) {
        console.warn("[DELETE-USER] Error deleting profile:", profileError);
      } else {
        console.log("[DELETE-USER] Profile deleted successfully");
      }

      // Delete from enrollments table
      const { error: enrollmentError } = await supabaseAdmin
        .from("enrollments")
        .delete()
        .eq("user_id", user.id);

      if (enrollmentError) {
        console.warn(
          "[DELETE-USER] Error deleting enrollments:",
          enrollmentError
        );
      } else {
        console.log("[DELETE-USER] Enrollments deleted successfully");
      }

      // Delete from user_subscriptions table
      const { error: subscriptionError } = await supabaseAdmin
        .from("user_subscriptions")
        .delete()
        .eq("user_id", user.id);

      if (subscriptionError) {
        console.warn(
          "[DELETE-USER] Error deleting subscriptions:",
          subscriptionError
        );
      } else {
        console.log("[DELETE-USER] Subscriptions deleted successfully");
      }

      console.log("[DELETE-USER] Custom table cleanup completed");
    } catch (cleanupError) {
      console.warn("[DELETE-USER] Error during table cleanup:", cleanupError);
      // Continue with user deletion even if cleanup fails
    }

    // Delete the user from auth.users using the admin client
    console.log("[DELETE-USER] Attempting to delete user from auth.users...");
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error(
        "[DELETE-USER] Error deleting user from auth.users:",
        deleteError
      );
      return new Response(
        JSON.stringify({
          error: "Failed to delete user account",
          details: deleteError.message,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    console.log(
      `[DELETE-USER] Successfully deleted user: ${user.email} (ID: ${user.id})`
    );

    return new Response(
      JSON.stringify({
        message: "User account deleted successfully",
        userId: user.id,
        email: user.email,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    console.error(
      "[DELETE-USER] Unexpected error in delete-user-handler:",
      err
    );
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: err.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
