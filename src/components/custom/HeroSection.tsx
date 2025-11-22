import { useUser } from "@/contexts/UserContext";
import heroBG from "/assets/heroGradient.png";
import { Link } from "react-router-dom";

export default function HeroSection() {
  let { isAuthenticated } = useUser();
  return (
    <div
      className="w-full flex flex-col items-center justify-start p-4 md:py-12 lg:py-20"
      style={{
        backgroundImage: `url(${heroBG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto text-center">
        <p className="text-sm font-semibold tracking-wide uppercase">
          Maximize Your Creative Future Today!
        </p>
        <h1 className="text-xl sm:text-2xl font-extrabold leading-tight max-w-sm">
          Tony Klinger Will Show You How to Make Your Dreams Come True
        </h1>
        <div className="w-full py-6 lg:py-8 flex flex-col lg:flex-row gap-3 lg:gap-6 items-center justify-center">
          <div className="w-full max-w-xl lg:w-1/2 rounded-md overflow-hidden bg-gray-900 shadow-md">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title='Tony Klinger Online Coaching Videos - "WELCOME TO OUR NEW WEB/APP An Introduction"'
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div className="w-full max-w-xl lg:w-1/2 rounded-md overflow-hidden bg-gray-900 shadow-md">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/d-oJ_6oI-2I"
                title='Tony Klinger Online Coaching Videos - "The Journey Continues"'
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
        <p className="max-w-xl text-base font-medium text-gray-200 leading-relaxed px-4">
          This course, based on his books,{" "}
          <span className="font-bold text-blue-300">
            “How to Get into the Movie Industry”
          </span>{" "}
          and{" "}
          <span className="font-bold text-purple-300">
            “How to Get Your Movie Made”
          </span>{" "}
          will teach you how to maximize your chances of success in the film
          industry.
        </p>
        <Link
          to="/course-dashboard"
          className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 py-3 text-lg font-semibold bg-[#3bb4fd] hover:bg-[#3b9cfd] rounded-md shadow-md transition-all duration-300 cursor-pointer"
        >
          Start Today!
        </Link>
        {isAuthenticated && (
          <Link
            to="/dashboard/membership"
            className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 py-3 text-lg font-semibold bg-[#3bb4fd] hover:bg-[#3b9cfd] rounded-md shadow-md transition-all duration-300 cursor-pointer"
          >
            Get Membership
          </Link>
        )}
      </div>
    </div>
  );
}
