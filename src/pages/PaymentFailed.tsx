import { Link } from "react-router-dom";

export default function PaymentFailed() {
  return (
    <div className="flex items-center justify-center min-h-screen font-inter">
      <div className="text-center p-8 bg-[#1b1b27] rounded-lg shadow-xl max-w-sm w-full">
        <svg
          className="mx-auto h-16 w-16 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h1 className="text-3xl font-bold text-red-600 mt-4 mb-2">
          Payment Failed
        </h1>
        <p className="mb-6">
          There was an issue processing your payment, or you cancelled the
          process. Please try again.
        </p>
        <Link
          to="/course-buying-page"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Try Again
        </Link>
        <p className="text-gray-200 text-sm mt-4">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
