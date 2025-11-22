import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ButtonGhost } from "@/components/utility";
import { useUser } from "@/contexts/UserContext";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { Dispatch, SetStateAction } from "react";
import { IoMdClose } from "react-icons/io";

export default function AdminSidebar({
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
          <img src="/assets/logoXL.png" alt="GGGE Logo" className="h-9" />

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
            <ButtonGhost
              isLink={true}
              to="/admin/course-list"
              text={<span className="font-semibold">Courses</span>}
            />
          </nav>

          <hr className="opacity-10" />
        </div>

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
