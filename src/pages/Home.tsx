import { Link } from "react-router-dom";
import Summary from "@/components/custom/Summary";
import Testimonials from "@/components/custom/Testimonials";
import HeroSection from "@/components/custom/HeroSection";
import BioSection from "@/components/custom/BioSection";

export default function Home() {
  return (
    <section className="w-full flex flex-col items-center justify-start">
      <HeroSection />

      {/* Optional Bio Section */}
      <BioSection />
      <Summary />
      <Testimonials />

      {/* Space before button */}
      <div className="h-10" />

      <Link
        to="/pricing-page"
        className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 py-3 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-lg transition-all duration-300 text-center mb-10"
      >
        See Buying Page
      </Link>
    </section>
  );
}