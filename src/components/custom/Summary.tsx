import { learnings } from "@/constants/data";

export default function Summary() {
  return (
    <section className="flex flex-col items-center justify-center py-16">
      <h2 className="text-3xl font-bold mb-4 md:mb-6">What You'll Learn</h2>
      <section className="w-[90%] lg:w-1/2 flex flex-col items-center justify-center gap-4 md:gap-6">
        {learnings.map((item, i) => (
          <div key={i} className="flex flex-col items-center justify-center">
            <h2 className="text-center font-semibold text-base">
              {item.topic}
            </h2>
            <p className="text-center">{item.content}</p>
          </div>
        ))}
        ... and much more
      </section>
    </section>
  );
}
