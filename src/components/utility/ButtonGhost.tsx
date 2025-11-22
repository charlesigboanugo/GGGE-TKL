import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/button";

export default function ButtonGhost({
  text,
  isLink,
  to,
  type = "button",
  extraClasses,
  onClickEvent,
}: Partial<{
  text: ReactNode;
  isLink: boolean;
  to: string;
  type: "button" | "submit" | "reset";
  extraClasses: string;
  onClickEvent: () => void;
}>) {
  return (
    <>
      {isLink ? (
        <NavLink
          to={to as string}
          onClick={onClickEvent}
          className={({ isActive }) =>
            `text-sm font-semibold px-4 py-2 text-white rounded-md transition-all duration-300 flex items-center justify-center space-x-2 ${
              isActive ? "bg-[#373751]" : "bg-transparent"
            } hover:bg-[#4a4a60f1] active:bg-[#2c2c38] ${extraClasses}`
          }
        >
          {text}
        </NavLink>
      ) : (
        <Button
          type={type}
          onClick={onClickEvent}
          className={`cursor-pointer text-sm font-semibold px-4 py-2 text-white shadow-lg rounded-full bg-[#373751] hover:bg-[#4a4a60f1] active:bg-[#2c2c38] transition-all duration-300 ${extraClasses}`}
        >
          {text}
        </Button>
      )}
    </>
  );
}
