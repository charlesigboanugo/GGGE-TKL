import { tonyBio } from "@/constants/data";

export default function BioSection() {
  return (
    <section
      className="w-full py-16 flex flex-col items-center"
      style={{ backgroundColor: "rgb(19,19,30)" }}  // opposite of summary
    >
      <div
        className="w-[90%] md:w-3/4 lg:w-1/2 p-8 rounded-2xl shadow-md flex flex-col items-center gap-6"
        style={{ backgroundColor: "rgb(26,26,39)" }} // opposite box color
      >
        {/* Profile Image */}
        <img
          src={tonyBio.photo}
          alt={tonyBio.name}
          className="w-40 h-40 rounded-full object-cover mx-auto shadow-lg"
        />

        <h2 className="text-3xl font-bold text-white text-center">
          {tonyBio.name}
        </h2>

        {/* Bio paragraphs */}
        <div className="space-y-4">
          {tonyBio.paragraphs.map((text, i) => (
            <p
              key={i}
              className="text-gray-300 leading-relaxed text-center text-sm md:text-base"
            >
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}