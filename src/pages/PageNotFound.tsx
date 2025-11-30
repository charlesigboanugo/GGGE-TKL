import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <section className="min-h-screen w-full flex items-center justify-center text-xl lg:text-2xl font-bold">
      <p> Page Not Found </p>
      <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Go Home
        </Link>
    </section>
  );
}
