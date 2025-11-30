import { testimonials } from "@/constants/data";

export default function Testimonials() {
  return (
    <section
      className="w-full py-16 flex flex-col items-center justify-center"
      style={{
        background: "rgb(26,26,39)",
      }}
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 text-center">
        Testimonials
      </h2>

      <div className="w-[90%] md:w-3/4 lg:w-1/2 flex flex-col items-center justify-center gap-6">
        {testimonials.map((item, i) => (
          <div
            key={i}
            className="px-6 sm:px-10 py-6 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/10 shadow-md"
            style={{
              background: "rgb(19,19,30)",
            }}
          >
            <p className="text-sm sm:text-base text-white leading-relaxed text-center italic">
              "{item.feedback}"
            </p>
            <h3 className="text-center text-white font-semibold mt-2">
              - <span className="font-bold">{item.username}</span>
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}