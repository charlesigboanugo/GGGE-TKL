import { testimonials } from "@/constants/data";

export default function Testimonials() {
  return (
    <section className="w-[90%] lg:w-1/2 flex flex-col items-center justify-center gap-4 md:gap-6 mb-4 md:mb-6">
      {testimonials.map((item, i) => (
        <div
          key={i}
          className="bg-[#1b1b27] px-10 py-6 rounded-lg flex flex-col items-center justify-center gap-3"
        >
          <p className="text-sm">{item.feedback}</p>
          <h2 className="font-semibold">- {item.username}</h2>
        </div>
      ))}
    </section>
  );
}
