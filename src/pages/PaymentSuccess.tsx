import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: You might want to add logic here to confirm the purchase
    // with your backend (e.g., fetch user's enrollments/subscriptions)
    // to ensure data consistency, though the webhook should handle it.

    // Redirect to a user-specific dashboard or profile after a short delay
    const timer = setTimeout(() => {
      navigate("/course-dashboard"); // Adjust this route to your user's main dashboard
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen font-inter">
      <div className="text-center p-8 bg-[#1b1b27] rounded-lg shadow-xl max-w-sm w-full">
        <svg
          className="mx-auto h-16 w-16 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h1 className="text-3xl font-bold text-green-500 mt-4 mb-2">
          Payment Successful!
        </h1>
        <p className="mb-6">
          Thank you for your purchase. Your enrollment/membership is now active.
        </p>
        <p className="text-gray-200 text-sm">
          You will be redirected shortly...
        </p>
      </div>
    </div>
  );
}
