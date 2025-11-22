import { useEffect, useState } from "react";
import { useCallback } from "react";
import { supabase } from "@/supabase_client";
import { CreditCard } from "lucide-react";

// ----------------- Types -----------------
export type CartItemType = {
  type: "course" | "cohort" | "subscription";
  courseId?: string;
  cohortId?: string;
  variantId?: string;
  name: string;
  variantName: string;
  price: number;
};

interface PaymentComponentProps {
  paymentType: "one_time" | "subscription";
  user: any;
  cartItems: CartItemType[];
  isGlobalEnrollmentOpen: boolean;
  isDisabled?: boolean;
  currentLaunchPhase: string | null;
  
}

// ----------------- Constants -----------------
const BASE_URL = import.meta.env.VITE_PUBLIC_REDIRECT_URL || "http://localhost:5173";
const PAYMENT_SUCCESS_URL = `${BASE_URL}/payment-success`;
const PAYMENT_CANCEL_URL = `${BASE_URL}/payment-failed`;


// ----------------- Component -----------------
export default function PaymentComponent({
  paymentType,
  user,
  cartItems,
  isGlobalEnrollmentOpen,
  isDisabled = false,
  currentLaunchPhase
}: PaymentComponentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //const [hasAnyCourseEnrollment, setHasAnyCourseEnrollment] = useState(false);
  //const [hasAnyCohortEnrollment, setHasAnyCohortEnrollment] = useState(false);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const [loadingChecks, setLoadingChecks] = useState(true);

  const performMembershipChecks = useCallback(async () => {
    if (!user?.id) {
      setLoadingChecks(false);
      return;
    }

    setLoadingChecks(true);
    setError(null);

    try {
      // 🔹 Check subscription status
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"])
        .maybeSingle();

      if (subscriptionError && subscriptionError.code !== "PGRST116") {
        console.error("Error fetching subscription:", subscriptionError);
      }
      setIsAlreadySubscribed(!!subscriptionData);

      // 🔹 Check course enrollments
      /*const { data: courseEnrollments, error: courseEnrollmentsErr } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (courseEnrollmentsErr) {
        console.error("Error fetching enrollments:", courseEnrollmentsErr);
        setHasAnyCourseEnrollment(false);
      } else {
        setHasAnyCourseEnrollment(!!(courseEnrollments && courseEnrollments.length > 0));
      }

      // 🔹 Check cohort enrollments
      const { data: cohortEnrollments, error: cohortEnrollmentsErr } = await supabase
        .from("cohort_enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (cohortEnrollmentsErr) {
        console.error("Error fetching cohort enrollments:", cohortEnrollmentsErr);
        setHasAnyCohortEnrollment(false);
      } else {
        setHasAnyCohortEnrollment(!!(cohortEnrollments && cohortEnrollments.length > 0));
      }
      */
    } catch (err) {
      console.error("Membership check error:", err);
      setError("Failed to load user enrollment/membership status.");
    } finally {
      setLoadingChecks(false);
    }
  }, [
    user?.id,
    setLoadingChecks,
    setError,
    setIsAlreadySubscribed,
    //setHasAnyCourseEnrollment,
    //setHasAnyCohortEnrollment,
  ]);

  useEffect(() => {
    if (user) performMembershipChecks();
    else setLoadingChecks(false);
  }, [performMembershipChecks, user]);
  

  // ----------------- Cart Validation -----------------
  const validateCartItems = (items: CartItemType[]) => {
    if (!items || !Array.isArray(items) || items.length === 0) throw new Error("Cart is empty");

    return items.map((item, idx) => {
      const errors: string[] = [];
      if (!item.name) errors.push("name missing");
      if (!item.variantName) errors.push("variantName missing");
      if (item.price === null || item.price === undefined || isNaN(Number(item.price))) {
        errors.push("invalid price");
      }
      if (errors.length) throw new Error(`Cart item ${idx + 1}: ${errors.join(", ")}`);
      return { ...item, price: Number(item.price) };
    });
  };


  // ----------------- Checkout Handler -----------------
  const handleInitiateCheckout = async () => {
    if (loading || loadingChecks || isDisabled) return;
    if (!user?.id) {
      setError("Please log in to proceed with payment.");
      alert("Please log in to proceed with payment.");
      return;
    }

    // Subscription rules
    if (paymentType === "subscription") {
      if (isAlreadySubscribed) {
        setError("You are already a member.");
        alert("You are already a member.");
        return;
      }
      if (cartItems.length > 1) {
        setError("Invalid cart for membership subscription.");
        alert("Invalid cart for membership subscription.");
        return;
      }
    }

    // One-time purchase rules
    if (paymentType === "one_time" && !isGlobalEnrollmentOpen) {
      setError("Course/Cohort enrollment is currently closed.");
      alert("Course/Cohort enrollment is currently closed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(
        "Cart items before validation:",
        JSON.stringify(cartItems, null, 2)
      );

      const validatedItems = paymentType === "one_time" ? validateCartItems(cartItems) : [];

      console.log("Validated cart items:", validatedItems);

      if (validatedItems.length < 1 && paymentType === "one_time")
      {
        setError("No valid items in cart for one-time payment.");
        alert("No valid items in cart for one-time payment.");
        return;
      }

      const totalPrice =
        validatedItems.length > 0
          ? validatedItems.reduce((sum, i) => sum + i.price, 0)
          : 0;

      const requestBody: any = {
        paymentType,
        successUrl: PAYMENT_SUCCESS_URL,
        cancelUrl: PAYMENT_CANCEL_URL,
        currency: "gbp",
        userId: user.id,
        userEmail: user.email,
        clientReferenceId: user.id,
        metadata: { userId: user.id, email: user.email, no_balance: "true" },
        cartItems: validatedItems,
        totalPrice,
      };

      if (paymentType === "subscription") {
        requestBody.priceId = import.meta.env.VITE_STRIPE_SUBSCRIPTION_PRICE_ID || "price_123";
      }

      console.log(
        "Sending request body for checkout:",
        JSON.stringify(requestBody, null, 2)
      );
      
      // Get session and call Edge Function
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token)
        throw new Error("Failed to retrieve session.");

      const { data, error: invokeError } = await supabase.functions.invoke(
        "create-stripe-checkout-session",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
          body: requestBody,
        }
      );

      console.log("Edge function response:", { data, error: invokeError });
      
      if (invokeError) throw new Error(invokeError.message || "Failed to create session");
      if (!data?.sessionId) throw new Error("Invalid stripe sessionId(url) returned");

      window.location.href = data.sessionId;
    } catch (err: any) {
      console.error("Payment initiation failed:", err);
      setError(err.message || "Payment failed.");
      alert(`Payment initiation failed: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Cancel Subscription -----------------
  /*const handleCancelSubscription = async () => {
    if (loading || loadingChecks || isDisabled) return;

    if (!user || !user.id) {
      setError("Please log in to cancel subscription.");
      alert("Please log in to cancel subscription.");
      return;
    }

    console.log("User object:", JSON.stringify(user, null, 2));

    setLoading(true);
    setError(null);

    try {
      // Fetch fresh session to ensure access_token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token)
        throw new Error("Failed to retrieve session.");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_PROJECT_URL}/functions/v1/cancel-subscription`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (!response.ok) throw new Error(await response.text());
      alert("Subscription cancelled successfully.");
      await performMembershipChecks();
    } catch (err: any) {
      console.error("Cancel subscription error:", err);
      setError(err.message || "Failed to cancel subscription.");
      alert(`Cancellation failed: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };*/

  // ----------------- Button Logic -----------------
  const totalPrice = cartItems.reduce((sum, i) => sum + i.price, 0);
  let finalIsDisabled = isDisabled || loading || loadingChecks;
  let buttonText = "";
  const onClickHandler = handleInitiateCheckout;

  if (paymentType === "one_time") {
    if (loading) buttonText = "Processing Purchase...";
    else if (loadingChecks) buttonText = "Loading...";
    else if (!isGlobalEnrollmentOpen) {
      buttonText = !currentLaunchPhase ?  "loading..." : `Enrollment is ${currentLaunchPhase}`;
      finalIsDisabled = true;
    } else if (cartItems.length === 0) {
      buttonText = "Add Courses or Cohorts to Cart";
      finalIsDisabled = true;
    } else buttonText = `Pay £${totalPrice.toLocaleString()} Now`;
  } else if (paymentType === "subscription") {
    if (loading) buttonText = "Processing...";
    else if (loadingChecks) buttonText = "Checking Membership...";
    /*else if (isAlreadySubscribed) {
      buttonText = "Unsubscribe";
      onClickHandler = handleCancelSubscription;*/
    else buttonText = "Proceed to Membership Subscription";
  }

  /*const debugInfo = {
    paymentType,
    user: user
      ? { id: user.id, email: user.email, hasAccessToken: !!user.access_token }
      : null,
    cartItemsCount: cartItems ? cartItems.length : 0,
    isEnrollmentOpen,
    isDisabledFromParent: isDisabled,
    loadingComponent: loading,
    loadingChecks: loadingChecks,
    hasAnyCourseEnrollment: hasAnyCourseEnrollment,
    hasAnyCohortEnrollment: hasAnyCohortEnrollment,
    isAlreadySubscribed: isAlreadySubscribed,
    finalIsDisabled: finalIsDisabled,
    buttonText: buttonText,
    totalPrice: cartItems
      ? cartItems.reduce((sum, item) => sum + item.price, 0)
      : 0,
  };*/

  return (
    <div className="mt-8">
      {/*
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-2 bg-gray-500 rounded text-xs">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )} 
       */}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={onClickHandler}
        disabled={finalIsDisabled}
        className={`cursor-pointer flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg shadow-md font-semibold
          ${
            paymentType === "one_time"
              ? "bg-blue-500 hover:bg-blue-600"
              : isAlreadySubscribed
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <CreditCard className="w-5 h-5" />
        {buttonText}
      </button>
    </div>
  );
}