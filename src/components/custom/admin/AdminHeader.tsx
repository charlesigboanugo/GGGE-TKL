import { ButtonGhost } from "@/components/utility";
import { useUser } from "@/contexts/UserContext";
import { LogOut } from "lucide-react";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { IoMdMenu } from "react-icons/io";

export default function AdminHeader() {
  let { isAuthenticated, signOut } = useUser();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <header className="flex items-center justify-between md:justify-around px-6 md:px-16 lg:px-20 py-4 bg-[#222230] text-white shadow-lg relative z-20">
      <div className="w-full flex items-center space-x-4 justify-between md:justify-start">
        <img src="/assets/logoXL.png" alt="GGGE Logo" className="h-9" />

        <ButtonGhost
          isLink={false}
          onClickEvent={() => setIsSidebarOpen(true)}
          text={<IoMdMenu />}
          extraClasses="md:hidden text-2xl"
        />

        <ButtonGhost
          isLink={true}
          to="/admin/course-list"
          text={<span className="font-semibold">Courses</span>}
          extraClasses="hidden md:inline-block"
        />
      </div>

      <div className="flex items-center space-x-2">
        {isAuthenticated ? (
          <ButtonGhost
            isLink={false}
            onClickEvent={signOut}
            text={<LogOut />}
            extraClasses="hidden md:inline-block bg-transparent"
          />
        ) : (
          <ButtonGhost
            isLink={true}
            to="/signin"
            text={<span>Sign In / Sign Up</span>}
            extraClasses="hidden md:inline-block"
          />
        )}
      </div>

      {/* Sidebar Component */}
      <AdminSidebar isOpen={isSidebarOpen} closeSidebar={setIsSidebarOpen} />
    </header>
  );
}
