import { useUser } from "@/contexts/UserContext";
import heroBG from "/assets/heroGradient.png";
import { Link } from "react-router-dom";

export default function HeroSection() {
  const { isAuthenticated } = useUser();

  return (
    <div
      className="w-full flex flex-col items-center justify-start px-4 py-10 md:py-12"
      style={{
        backgroundImage: `url(${heroBG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-4xl w-full mx-auto text-center space-y-4">
        
        {/* HERO TOP LABEL */}
        <p className="text-xs sm:text-sm font-semibold tracking-widest text-white/90 uppercase">
          Maximize Your Creative Future Today!
        </p>

        {/* HERO TITLE */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-snug mx-auto max-w-2xl">
          Tony Klinger Will Show You How to Make Your Dreams Come True
        </h1>

        {/* VIDEO */}
        <div className="flex flex-col items-center justify-center py-3 lg:py-6">
          <div className="relative w-full max-w-xl sm:max-w-2xl lg:max-w-3xl rounded-2xl overflow-hidden shadow-2xl bg-black/60">
            <div className="w-full aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/iRpA-uO6MYA?rel=0"
                title="Tony Klinger Introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        {/* DESCRIPTION BELOW VIDEO */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-gray-200 leading-relaxed px-4">
          This course, based on his books{" "}
          <span className="font-bold text-blue-300">“How to Get into the Movie Industry”</span>{" "}
          and{" "}
          <span className="font-bold text-purple-300">“How to Get Your Movie Made”</span>,
          will teach you how to maximize your chances of success in the film industry.
        </p>

        {/* BUTTONS */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <Link
            to="/learning-dashboard"
            className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 py-3 text-lg sm:text-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-lg transition-all duration-300"
          >
            Start For Free Today!
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard/membership"
              className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 py-3 text-lg sm:text-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-lg transition-all duration-300"
            >
              View Membership
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}