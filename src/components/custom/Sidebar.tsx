import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { IoMdClose, IoMdHome } from "react-icons/io";
import { SlGraduation } from "react-icons/sl";
import { Link } from "react-router-dom";
import { ButtonGhost } from "../utility";
import type { Dispatch, SetStateAction } from "react";
import { FaUser } from "react-icons/fa";
import { Settings } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { RiTeamFill } from "react-icons/ri";

export default function Sidebar({
  isOpen,
  closeSidebar,
}: {
  isOpen: boolean;
  closeSidebar: Dispatch<SetStateAction<boolean>>;
}) {
  const handleActionAndCloseSidebar = () => closeSidebar(false);

  let { isAuthenticated, signOut } = useUser();

  return (
    <Sheet open={isOpen} onOpenChange={closeSidebar}>
      <SheetContent
        side="right"
        className="w-[280px] sm:w-[350px] flex flex-col p-4 bg-[#222230] border-none"
      >
        <VisuallyHidden>
          <SheetTitle>Main Menu</SheetTitle>
          <SheetDescription>
            Navigation links for the educational web application.
          </SheetDescription>
        </VisuallyHidden>
        <SheetHeader className="flex flex-row items-center justify-between pb-6 border-b border-[#333340]">
          <Link to="/" onClick={handleActionAndCloseSidebar}>
            <img src="/assets/logoXL.png" alt="GGGE Logo" className="h-9" />
          </Link>
          <ButtonGhost
            onClickEvent={handleActionAndCloseSidebar}
            isLink={false}
            text={<IoMdClose className="text-2xl" />}
            extraClasses="!p-2 !w-auto !h-auto"
            aria-label="Close menu"
          />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-6 space-y-8">
          <nav className="grid gap-4">
            <h2 className="text-lg font-extrabold mb-2 text-white">Home</h2>
            <ButtonGhost
              isLink={true}
              to="/"
              text={
                <>
                  <IoMdHome className="text-xl" />
                  <span className="font-semibold">Home</span>
                </>
              }
              onClickEvent={handleActionAndCloseSidebar}
              extraClasses="w-full flex items-center justify-start gap-2"
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
              extraClasses="w-full flex items-center justify-start gap-2"
            />

            <ButtonGhost
              isLink={true}
              to="/learning-dashboard"
              text={
                <>
                  <SlGraduation className="text-xl" />
                  <span className="font-semibold flex items-center justify-start gap-2">
                    Dashboard
                  </span>
                </>
              }
              onClickEvent={handleActionAndCloseSidebar}
              extraClasses="w-full flex items-center justify-start gap-2"
            />
          </nav>

          <hr className="opacity-10" />

          {isAuthenticated && (
            <nav className="grid gap-4">
              <h2 className="text-lg font-extrabold mb-2 text-white">
                Dashboard
              </h2>

              <ButtonGhost
                isLink={true}
                to="/dashboard/basic"
                text={
                  <>
                    <SlGraduation className="text-xl" />
                    <span className="font-semibold flex items-center justify-start gap-2">
                      Basic
                    </span>
                  </>
                }
                onClickEvent={handleActionAndCloseSidebar}
                extraClasses="w-full flex items-center justify-start gap-2"
              />

              <ButtonGhost
                isLink={true}
                to="/dashboard/membership"
                text={
                  <>
                    <SlGraduation className="text-xl" />
                    <span className="font-semibold flex items-center justify-start gap-2">
                      Membership
                    </span>
                  </>
                }
                onClickEvent={handleActionAndCloseSidebar}
                extraClasses="w-full flex items-center justify-start gap-2"
              />

              <ButtonGhost
                isLink={true}
                to="/dashboard/setting"
                text={
                  <>
                    <Settings className="text-xl" />
                    <span className="font-semibold flex items-center justify-start gap-2">
                      Account Setting
                    </span>
                  </>
                }
                onClickEvent={handleActionAndCloseSidebar}
                extraClasses="w-full flex items-center justify-start gap-2"
              />
            </nav>
          )}
        </div>

        <ButtonGhost
          isLink={true}
          to="/pricing-page"
          text={
            <>
              <span className="font-bold text-lg">$</span>
              <span className="font-semibold flex items-center justify-start gap-2">
                Pricing
              </span>
            </>
          }
          onClickEvent={handleActionAndCloseSidebar}
          extraClasses="w-full flex items-center justify-start"
        />

        {isAuthenticated && (
          <ButtonGhost
            isLink={true}
            to="/profile"
            text={
              <>
                <FaUser className="text-sm" />
                <span className="font-semibold">Profile</span>
              </>
            }
            onClickEvent={handleActionAndCloseSidebar}
            extraClasses="w-full flex items-center justify-start"
          />
        )}

        <SheetFooter className="pt-6 border-t border-[#333340]">
          {isAuthenticated ? (
            <ButtonGhost
              isLink={false}
              text={<span>Sign Out</span>}
              onClickEvent={() => {
                signOut();
                handleActionAndCloseSidebar();
              }}
              extraClasses="w-full flex items-center justify-center"
            />
          ) : (
            <ButtonGhost
              isLink={true}
              to="/signin"
              text={<span>Sign In / Sign Up</span>}
              onClickEvent={handleActionAndCloseSidebar}
              extraClasses="w-full flex items-center justify-center"
            />
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
