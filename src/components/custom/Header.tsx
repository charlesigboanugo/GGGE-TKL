import { Link } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { SlGraduation } from "react-icons/sl";
import { IoMdMenu } from "react-icons/io";
import { useState } from "react";
import { Sidebar } from "./index";
import { FaUser } from "react-icons/fa";
import { ButtonGhost } from "../utility";
import { LogOut, Settings } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { RiTeamFill } from "react-icons/ri";

export default function Header() {
  let { isAuthenticated, currentUser, signOut } = useUser();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <header className="flex items-center justify-between md:justify-around px-6 md:px-16 lg:px-20 py-4 bg-[#222230] text-white shadow-lg relative z-20">
      <Link to="/" className="lg:hidden">
        <img src="/assets/logoXL.png" alt="GGGE" className="h-8 md:h-10" />
      </Link>
      <div className="hidden lg:flex lg:items-center lg:space-x-4">
        <Link to="/" className="flex items-center">
          <img src="/assets/logoXL.png" alt="GGGE" className="h-8 md:h-10" />
        </Link>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <ButtonGhost
            isLink={true}
            to="/home"
            text={
              <>
                <IoMdHome className="text-lg" />
                <span className="font-semibold">Home</span>
              </>
            }
            extraClasses="lg:flex lg:items-center hidden"
          />

          <ButtonGhost
            isLink={true}
            to="/meet-the-team"
            text={
              <>
                <RiTeamFill className="text-lg" />
                <span className="font-semibold">Meet The Team</span>
              </>
            }
            extraClasses="md:flex lg:items-center hidden"
          />

          <ButtonGhost
            isLink={true}
            to="/course-buying-page"
            text={
              <>
                <span className="font-bold text-lg">$</span>
                <span className="font-semibold">Courses</span>
              </>
            }
            extraClasses="justify-start"
          />
        </nav>
      </div>

      <div className="hidden lg:flex lg:items-center lg:space-x-2">
        {isAuthenticated ? (
          <>
            <ButtonGhost
              isLink={true}
              to="/learning-dashboard"
              text={
                <>
                  <SlGraduation className="text-xl" />
                  <span className="font-semibold">Dashboard</span>
                </>
              }
              extraClasses="hidden md:w-full md:flex md:items-center md:justify-start"
            />
            <ButtonGhost
              isLink={true}
              to={`/profile/${currentUser?.id}`}
              text={
                <>
                  <FaUser className="text-sm" />
                  <span className="font-semibold hidden md:inline">
                    Profile
                  </span>
                </>
              }
              extraClasses="md:flex md:items-center md:justify-center hidden"
            />
            <ButtonGhost
              isLink={true}
              to="/dashboard/membership"
              text={<span className="font-semibold">Membership</span>}
              extraClasses="hidden md:inline-block"
            />
            <ButtonGhost
              isLink={true}
              to="/dashboard/basic"
              text={<Settings />}
              extraClasses="hidden md:inline-block"
            />

            <ButtonGhost
              isLink={false}
              onClickEvent={signOut}
              text={<LogOut />}
              extraClasses="hidden md:inline-block bg-transparent"
            />
          </>
        ) : (
          <ButtonGhost
            isLink={true}
            to="/signin"
            text={<span>Sign In / Sign Up</span>}
            extraClasses="hidden md:inline-block"
          />
        )}
      </div>

      <div className="lg:hidden text-2xl">
        <ButtonGhost
          isLink={false}
          onClickEvent={() => setIsSidebarOpen(true)}
          text={<IoMdMenu />}
          extraClasses=""
        />
      </div>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={setIsSidebarOpen} />
    </header>
  );
}
