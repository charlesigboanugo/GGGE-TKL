import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function About({
  name,
  avatar,
  bio,
}: {
  name: string;
  bio: ReactNode;
  avatar: string;
}) {
  return (
    <section className="bg-[#1b1b27] w-[90%] lg:w-[80%] md:mt-8 py-8 px-4 flex flex-col items-center justify-center lg:flex-row gap-4 lg:gap-12 rounded-lg shadow-xl mb-12">
      <Avatar className="w-32 h-32 md:w-40 md:h-40 lg:w-80 lg:h-96 lg:rounded-xl shadow-lg">
        <AvatarImage
          src={avatar}
          alt={`Avatar of ${name}`}
          className="object-cover"
        />
        <AvatarFallback className="text-4xl md:text-5xl lg:text-6xl font-bold">
          TK
        </AvatarFallback>
      </Avatar>

      <div className="w-[95%] lg:w-[65%] flex flex-col gap-4 md:gap-6 items-center lg:items-start justify-center text-left">
        <h2 className="mx-auto text-lg sm:text-xl md:text-3xl text-left font-bold leading-tight">
          {name}
        </h2>
        <div className="text-sm text-left leading-relaxed bio-content flex flex-col gap-2">
          {bio}
        </div>
      </div>
    </section>
  );
}
