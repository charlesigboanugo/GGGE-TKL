import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import type { PhaseType } from "../../constants/types";
import type { CourseVariantType } from "../../pages/CourseBuyingPage";
import type { CohortVariantType } from "../../pages/CourseBuyingPage";

// Both course and cohort variants can be passed here
interface PricingCardProps {
  type: "course" | "cohort";
  variant: CourseVariantType | CohortVariantType; // can be CourseVariantType or CohortVariantType
  courseColor: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
  isAlreadyEnrolled: boolean;
  getPhaseInfo: (type: "course" | "cohort", variant: CourseVariantType | CohortVariantType) => Promise<{ phase_name: string; phase_text: string } | null>;
  getPrice: (type: "course" | "cohort", variant: CourseVariantType | CohortVariantType) => Promise<number>;
}

export default function PricingCard({
  type,
  variant,
  courseColor,
  isSelected,
  onSelect,
  disabled,
  isAlreadyEnrolled,
  getPhaseInfo,
  getPrice
}: PricingCardProps) {
  // --- Helper to get a display price based on current phase ---
  /*const getDisplayPrice = () => {
    if (!variant) return "N/A";

    if (currentPhase === "phase1") {
      // Course variant or cohort variant field
      return (
        variant.price_phase1 ||
        variant.price_phase1_1st
      );
    } else if (currentPhase === "phase2") {
      return (
        variant.price_phase2 ||
        variant.price_phase2_1st
      );
    }
    return "N/A";
  };

  const displayPrice = getDisplayPrice();*/

  const [currentPhase, setCurrentPhase] = useState<PhaseType | null>(null);
  const [displayPrice, setDisplayPrice] = useState<number | string>("N/A");
  const [phaseText, setPhaseText] = useState<string>("");

  useEffect(() => {
    async function fetchPhaseAndPrice() {
      const phase = await getPhaseInfo(type, variant);
      setCurrentPhase(phase?.phase_name as PhaseType);
      setPhaseText(phase?.phase_text || "");  
      if (!phase?.phase_name || phase.phase_name === "before_launch" || phase.phase_name === "closed") {
        setDisplayPrice("N/A");
      } else {
        const price = await getPrice(type, variant);
        setDisplayPrice(price);
      }
    }
    fetchPhaseAndPrice();
  }, [type, variant, getPhaseInfo, getPrice]);


  /* ---------------- helper to get phase badge ---------------- */

  const getPhaseLabelText = () => {
    if (!currentPhase || isAlreadyEnrolled) {
      return null;
    }

    if (currentPhase === "phase_1") {
      if (phaseText && phaseText.trim() !== "") {
        return (
          <p className="mt-3 text-center text-sm font-medium tracking-wide
            bg-gradient-to-r from-green-600 via-emerald-500 to-green-600
          text-white px-4 py-2 rounded-lg shadow-md animate-pulse"
          >
            {phaseText}
          </p>
        );
      }
      return (
        <p className="mt-3 text-center text-xs font-semibold tracking-wide uppercase
          bg-gradient-to-r from-green-600 via-emerald-500 to-green-600
        text-white px-4 py-2 rounded-lg shadow-md animate-pulse"
        >
          Early Bird
        </p>
      );
    }
    if (currentPhase === "phase_2") {
      if (phaseText && phaseText.trim() !== "") {
        return (
          <p className="mt-3 text-center text-sm font-medium tracking-wide
            bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600
          text-white px-4 py-2 rounded-lg shadow-md animate-pulse"
          >
            {phaseText}
          </p>
        );
      }
      return (
       <p className="mt-3 text-center text-sm font-medium tracking-wide
          bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600
        text-white px-4 py-2 rounded-lg shadow-md animate-pulse"
        >
          closes soon
        </p>
      );
    }
    return null;
  };

  const isVariantEnrollmentOpen = currentPhase === "phase_1" || currentPhase === "phase_2";

  // --- UI ---
  return (
    <div
      className={`bg-[#1b1b27] rounded-xl shadow-lg p-6 flex flex-col transition-all duration-200
        ${
          isSelected
            ? `${courseColor} border-2 border-blue-500 scale-105`
            : "border border-transparent"
        }
        ${disabled || !isVariantEnrollmentOpen ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold">{variant?.name}</h3>
        </div>

        <div className="flex items-center gap-2">
          {variant?.popular && (
            <span className="bg-yellow-500 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full">
              Popular
            </span>
          )}
        </div>
      </div>

      {variant?.description && (
        <p className="text-sm opacity-80 mb-4">{variant.description}</p>
      )}

      {variant?.duration && (
        <p className="text-sm font-medium mb-4">
          Duration: {variant.duration}
        </p>
      )}

      <div className="flex-grow">
        {Array.isArray(variant?.features) && (
          <ul className="space-y-2 mb-6">
            {variant.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- Price Display --- */}
      <div className="text-center mb-6">
        {currentPhase === "before_launch" || currentPhase === "closed" ? (
          <p className="text-lg font-bold text-gray-400">
            Enrollment{" "}
            {currentPhase === "before_launch" ? "Opens Soon" : "Closed"}
          </p>
        ) : (
          <p className="text-4xl font-bold text-white">
            £
            {typeof displayPrice === "number"
              ? displayPrice.toLocaleString()
              : displayPrice}
          </p>
        )}
        {/* ✅ Phase Text Below Price */}
        {getPhaseLabelText() && (
          <>
            {getPhaseLabelText()}
          </>
        )}
      </div>

      {/* --- Button --- */}
      <button
        onClick={onSelect}
        disabled={disabled || !isVariantEnrollmentOpen}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 
          ${
            isAlreadyEnrolled
              ? "bg-green-600 text-white cursor-not-allowed opacity-70"
              : isSelected
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }
          ${disabled || !isVariantEnrollmentOpen ? "cursor-not-allowed opacity-50 pointer-events-none" : ""}`}
      >
        {isAlreadyEnrolled ? (
          "Enrolled"
        ) : isSelected ? (
          <span className="flex items-center justify-center gap-2">
            <X className="w-4 h-4" /> Remove
          </span>
        ) : (
          "Select Plan"
        )}
      </button>
    </div>
  );
}