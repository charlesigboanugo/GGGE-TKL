import { HeroSection2 } from "@/components/custom";

export default function Home() {
  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-start">
      {/* <HeroSection /> */}
      <HeroSection2 />
      {/* 
      <Summary />
      <Testimonials /> 
      <Link
        to="/course-buying-page"
        className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 py-3 text-lg font-semibold bg-[#3bb4fd] hover:bg-[#3b9cfd] rounded-md shadow-md transition-all duration-300 cursor-pointer text-center mb-4"
      >
        See Buying Page
      </Link>
      */}
    </section>
  );
}
