import { AlertTriangle, Clock, ShoppingCart } from "lucide-react";

// ----------- Types -----------
export type PhaseType = "before_launch" | "phase_1" | "phase_2" | "closed";

export interface CourseVariantType {
  id: string;
  course_id: string;
  name: string;
  description: string;
  duration: string;
  features: string[];
  price_phase1: string;
  price_phase2: string;
}

export interface CourseType {
  id: string;
  name: string;
  description: string;
  color: string;
  status: string;
  variants: CourseVariantType[];
}

export interface CohortVariantType {
  id: string;
  cohort_id: string;
  name: string;
  description: string;
  features: string[];
  total_hours: number;
  cohort_dates: string[];
  time_slot: string;
  status: string;
  price_phase1: number;
  price_phase2: number;
}

export interface CohortType {
  id: string;
  name: string;
  description: string;
  color: string;
  status: string;
  variants: CohortVariantType[];
}

export interface CartItemType {
  type: "course" | "cohort" | "subscription";
  courseId?: string;
  cohortId?: string;
  variantId?: string;
  name: string;
  variantName: string;
  price: number;
}

interface CartPropsType {
  isSubscribed: boolean
  cartItems: CartItemType[];
  launchPhase: PhaseType | null;
  onCheckout: () => void;
  onClearCart: () => void;
  onRemoveItem: (
    type: "course" | "cohort" | "subscription",
    parentId?: string,
    variantId?: string
  ) => void;
  isCheckingOut: boolean;
}

// ----------- Component -----------
export default function Cart({
  isSubscribed,
  cartItems,
  launchPhase,
  onClearCart,
  onRemoveItem,
  isCheckingOut,
}: CartPropsType) {
  const isGlobalEnrollmentOpen = launchPhase === "phase_1" || launchPhase === "phase_2";
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  // ---------- Phase Display ----------
  function getPhaseDisplay() {
    if (launchPhase === "before_launch") {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Launch Pricing Preview</span>
          </div>
          <p className="text-sm text-blue-700">
            Pricing will be active once enrollment opens.
          </p>
        </div>
      );
    }
    if (launchPhase === "closed") {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Enrollment Closed</span>
          </div>
          <p className="text-sm text-red-700">
            The purchase window has closed. Stay tuned for the next launch!
          </p>
        </div>
      );
    }
    return null; // phase1 & phase2: open enrollment
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-[#1b1b27] rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Your selection is empty</h3>
          <p className="mb-4"> Select {isSubscribed ? "courses or cohorts" : "membership"} to get started!</p>
          {getPhaseDisplay()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1b1b27] rounded-xl shadow-lg p-6">
      {getPhaseDisplay()}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <h2 className="text-xl font-bold">Your Selection</h2>
        </div>
        <button
          onClick={onClearCart}
          disabled={!isGlobalEnrollmentOpen || isCheckingOut}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            isGlobalEnrollmentOpen && !isCheckingOut
              ? "text-red-600 hover:text-red-800 hover:bg-red-50"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {cartItems.map((item, index) => (
          <div
            key={`${item.type}-${item.courseId || item.cohortId}-${item.variantId}`}
            className="flex justify-between items-start p-4 bg-[#2d2d42] rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  #{index + 1}
                </span>
                <h4 className="font-medium">{item.name}</h4>
              </div>
              <p className="text-sm">{item.variantName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">£{item.price.toLocaleString()}</p>
              {item.type !== "subscription" && (
                <button
                  onClick={() =>
                    onRemoveItem(item.type, item.courseId || item.cohortId, item.variantId)
                  }
                  className="text-xs text-red-600 hover:text-red-800"
                  disabled={!isGlobalEnrollmentOpen || isCheckingOut}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <hr className="opacity-20 mb-4" />
      <div className="flex justify-between font-bold text-lg">
        <span>Total:</span>
        <span>£{totalPrice.toLocaleString()}</span>
      </div>
    </div>
  );
}