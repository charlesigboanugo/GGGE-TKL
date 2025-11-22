import React, { useState, useEffect } from "react";
import {
  Play,
  Camera,
  Users,
  Star,
  Clock,
  ArrowRight,
  Film,
  Theater,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";

const GGGELandingPage = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scenes = [
    { icon: Film, color: "text-red-500", bg: "bg-red-100" },
    { icon: Theater, color: "text-purple-500", bg: "bg-purple-100" },
    { icon: Calendar, color: "text-blue-500", bg: "bg-blue-100" },
  ];

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentScene((prev) => (prev + 1) % scenes.length);
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, scenes.length]);

  const FloatingElement = ({ children, delay = 0, className = "" }) => (
    <div
      className={`absolute animate-bounce ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: "3s",
      }}
    >
      {children}
    </div>
  );

  const PulsingOrb = ({
    size = "w-16 h-16",
    color = "bg-purple-500",
    delay = 0,
  }) => (
    <div
      className={`${size} ${color} rounded-full opacity-20 animate-pulse absolute`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: "2s",
      }}
    />
  );

  return (
    <div className="min-h-screen w-full p-8 flex flex-col justify-center items-center">
      <div className="flex flex-col items-center justify-center">
        {/* First Main Heading */}
        <h1 className="lg:text-7xl text-5xl text-center font-bold text-gray-800 mb-8 leading-tight">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Choose Your Creative Career.
          </span>
        </h1>

        {/* Introductory Paragraph */}
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 leading-relaxed mb-12 text-center">
          Welcome to Give Get Go Education CIC — a creative training space built
          for all kinds of minds. If you're dyslexic, neurodivergent, or someone
          who sees and processes the world differently — you belong here.
          Whether words move in unexpected ways, you learn best through sound or
          movement, or traditional methods haven't worked for you, we see you.
          Your creativity is powerful, your voice matters, and your way of
          thinking is not a flaw — it's a strength. Our platform supports
          diverse learning styles — visual, auditory, reading/writing,
          kinesthetic, social, solitary, or logical — with flexible tools,
          transcripts, voice-notes, real-world tasks, and space to go at your
          own pace. There's no 'right' way to learn here. Just your way. So take
          what you need, skip what doesn't serve you, and know this: you are not
          behind. You are not broken. You are just wired differently — and we've
          built this with you in mind.
        </p>

        {/* Second Heading for Courses */}
        <h2 className="text-gray-500 lg:text-5xl text-3xl text-center font-bold mb-12 mt-8">
          Explore The Below Courses:
        </h2>

        {/* Course Categories */}
        <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12 items-center justify-center mb-12">
          <div className="flex items-center justify-center gap-2 rounded-lg">
            <Film className="lg:w-10 lg:h-10 text-red-500 flex-shrink-0" />
            <h3 className="font-semibold lg:text-xl text-gray-200">
              Movie Production
            </h3>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-lg">
            <Theater className="lg:w-10 lg:h-10 text-purple-500 flex-shrink-0" />
            <h3 className="font-semibold lg:text-xl text-gray-200">
              Theatre Arts
            </h3>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-lg">
            <Calendar className="lg:w-10 lg:h-10 text-blue-500 flex-shrink-0" />
            <h3 className="font-semibold lg:text-xl text-gray-200">
              Event Management
            </h3>
          </div>
        </div>

        {/* <div className="mt-6 bg-gradient-to-r from-orange-700 to-red-600 text-white p-6 rounded-lg mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Limited Time Enrollment</span>
              </div>
              <p className="text-sm">
                Enrollment opens only four times a year. Don't miss your chance
                to secure your spot and start building your future. The clock is
                ticking!
              </p>
            </div>
          </div>
          */}

        {/* Explore Courses Button */}
        <Link
          to="/course-buying-page"
          className="mt-8 lg:mt-12 w-full group flex items-center justify-center sm:w-2/3 md:w-1/2 lg:w-1/3 py-3 text-lg lg:text-2xl font-semibold bg-[#3bb4fd] hover:bg-[#3b9cfd] rounded-md shadow-md transition-all duration-300 cursor-pointer text-center mb-4"
        >
          <span>Explore Courses</span>
          <ArrowRight className="w-7 h-7 translate-x-2 group-hover:translate-x-3 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
export default GGGELandingPage;
