import { learnings } from "@/constants/data";

export default function Summary() {
  return (
    <section
      className="w-full py-16 flex flex-col items-center justify-center"
      style={{
        background: "rgb(19,19,30)",
      }}
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 text-center">
        What You'll Learn
      </h2>

      <div className="w-[90%] md:w-3/4 lg:w-1/2 flex flex-col items-center justify-center gap-6">
        {learnings.map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 shadow-md"
            style={{
              background: "rgb(26,26,39)",
            }}
          >
            <h3 className="text-center text-lg md:text-xl font-semibold text-white">
              {item.topic}
            </h3>
            <p className="text-center text-gray-200 mt-2 text-sm md:text-base leading-relaxed">
              {item.content}
            </p>
          </div>
        ))}

        <div
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 shadow-md"
          style={{
            background: "rgb(26,26,39)",
          }}
        >
          <p className="text-center text-gray-200 text-sm md:text-base leading-relaxed italic">
            ... and much more
          </p>
        </div>
      </div>
    </section>
  );
}