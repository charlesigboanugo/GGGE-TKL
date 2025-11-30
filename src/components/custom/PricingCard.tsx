//import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import type { PhaseType } from "../../constants/types";
import type { CourseVariantType } from "../../pages/PricingPage";
import type { CohortVariantType } from "../../pages/PricingPage";

// Both course and cohort variants can be passed here
interface PricingCardProps {
  variant: CourseVariantType | CohortVariantType; // can be CourseVariantType or CohortVariantType
  courseColor: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
  isAlreadyEnrolled: boolean;
  launchPhase: PhaseType | null;
  isFullCohortMSelected: boolean;
  setIsFullCohortMSelected: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PricingCard({
  variant,
  courseColor,
  isSelected,
  onSelect,
  disabled,
  isAlreadyEnrolled,
  launchPhase,
  isFullCohortMSelected,
  setIsFullCohortMSelected,
}: PricingCardProps) {

  /* ---------------- helper to get phase badge ---------------- */

  const displayPrice = launchPhase === "before_launch" || launchPhase === "closed" ? "N/A" : launchPhase === "phase_1" ? variant.price_phase1 : variant.price_phase2;
  
  const getPhaseLabelText = () => {
    if (!launchPhase || isAlreadyEnrolled) {
      return null;
    }

    if (launchPhase === "phase_1") {
      if (variant.phase1_text && variant.phase1_text.trim() !== "") {
        return (
          <p className="mt-3 mb-3 text-center text-sm font-medium tracking-wide
            bg-gradient-to-r from-green-600 via-emerald-500 to-green-600
          text-white px-4 py-2 rounded-lg shadow-md animate-pulse"
          >
            {variant.phase1_text}
          </p>
        );
      }
    }
    if (launchPhase === "phase_2") {
      if (variant.phase2_text && variant.phase2_text.trim() !== "") {
        return (
          <p className="mt-3 mb-3 text-center text-sm font-medium tracking-wide
            bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600
          text-white px-4 py-2 rounded-lg shadow-md animate-pulse"
          >
            {variant.phase2_text}
          </p>
        );
      }
    }
    return null;
  };

  const isEnrollmentOpen = launchPhase === "phase_1" || launchPhase === "phase_2";

  // --- UI ---
  return (
    <div
      className={`bg-[#1b1b27] rounded-xl shadow-lg p-6 flex flex-col transition-all duration-200
        ${
          isSelected
            ? `${courseColor} border-2 border-blue-500 scale-105`
            : "border border-transparent"
        }
        ${disabled || !isEnrollmentOpen ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
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
        {/* ✅ Phase Text Below Price */}
        {getPhaseLabelText() && (
          <>
            {getPhaseLabelText()}
          </>
        )}
        {launchPhase === "before_launch" || launchPhase === "closed" ? (
          <p className="text-lg font-bold text-gray-400">
            Enrollment{" "}
            {launchPhase === "before_launch" ? "Opens Soon" : "Closed"}
          </p>
        ) : (
          <p className="text-4xl font-bold text-white">
            £
            {typeof displayPrice === "number"
              ? displayPrice.toLocaleString()
              : displayPrice}
          </p>
        )}
        
      </div>

      {/* --- Button --- */}
      <button
        onClick={onSelect}
        disabled={disabled || !isEnrollmentOpen}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 
          ${
            isAlreadyEnrolled
              ? "bg-green-600 text-white cursor-not-allowed opacity-70"
              : isSelected
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }
          ${disabled || !isEnrollmentOpen ? "cursor-not-allowed opacity-50 pointer-events-none" : ""}`}
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