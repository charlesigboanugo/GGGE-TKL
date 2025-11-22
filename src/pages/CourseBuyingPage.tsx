import { useState, useEffect } from "react";
import { supabase } from "@/supabase_client";
import { Check} from "lucide-react";
import {
  Cart,
  LaunchTimer,
  PricingCard,
  PaymentComponent,
} from "@/components/custom";
import { useUser } from "@/contexts/UserContext";

import type {PhaseType} from "../constants/types";

export interface CourseVariantType {
  id: string;
  course_id: string;
  name: string;
  description: string;
  duration: string;
  popular: boolean;
  features: string[];
  phase:  PhaseType;
  price_phase1: number;
  price_phase2: number;
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
  duration: string;
  popular: boolean;
  total_hours: number;
  cohort_dates: string[];
  time_slot: string;
  phase: PhaseType;
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
/** to update */
export interface CartItemType {
  type: "course" | "cohort" | "subscription";
  courseId?: string;
  cohortId?: string;
  subscriptionId?: string;
  variantId?: string;
  name: string;
  variantName: string;
  price: number;
}

export default function CourseBuyingPage() {
  const { currentUser, loadingUser } = useUser();

  const [activeCourseTab, setActiveCourseTab] = useState("film");
  const [activeCohortTab, setActiveCohortTab] = useState("cohort_film");

  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [launchPhase, setLaunchPhase] = useState<PhaseType | null>(null);

  const [coursesData, setCoursesData] = useState<CourseType[]>([]);
  const [cohortsData, setCohortsData] = useState<CohortType[]>([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingCohorts, setLoadingCohorts] = useState(true);
  const [loadingCourseEnrollments, setLoadingCourseEnrollments] = useState(true);
  const [loadingCohortEnrollments, setLoadingCohortEnrollments] = useState(true);

  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [cohortsError, setCohortsError] = useState<string | null>(null);
  const [courseEnrollmentsError, setCourseEnrollmentsError] = useState<string | null>(null);
  const [cohortEnrollmentsError, setCohortEnrollmentsError] = useState<string | null>(null);

  const [enrolledCourseVariantIds, setEnrolledCourseVariantIds] = useState<Set<string>>(new Set());
  const [enrolledCohortVariantIds, setEnrolledCohortVariantIds] = useState<Set<string>>(new Set());

  const [isSubscribed, setIsSubscribed] = useState(false);

  const isGlobalEnrollmentOpen = launchPhase === "phase_1" || launchPhase === "phase_2";

  useEffect(() => {
    async function fetchUserEnrollments() {
      if (!currentUser?.id) {
        setLoadingCourseEnrollments(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("enrollments")
          .select("variant_ids")
          .eq("user_id", currentUser.id)
          .eq("status", "completed");
        if (error) throw error;

        const all = new Set<string>();
        data.forEach((e) => e.variant_ids?.forEach((v: string) => all.add(v)));
        setEnrolledCourseVariantIds(all);
      } catch {
        setCourseEnrollmentsError("Failed to load course enrollments");
      } finally {
        setLoadingCourseEnrollments(false);
      }
    }

    async function fetchCohortEnrollments() {
      if (!currentUser?.id) {
        setLoadingCohortEnrollments(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("cohort_enrollments")
          .select("cohort_variant_ids, status")
          .eq("user_id", currentUser.id)
          .eq("status", "completed");

        if (error) throw error;

        const all = new Set<string>();
        data.forEach((e) => e.cohort_variant_ids?.forEach((v: string) => all.add(v)));
        setEnrolledCohortVariantIds(all);
      } catch {
        setCohortEnrollmentsError("Failed to load cohort enrollments");
      } finally {
        setLoadingCohortEnrollments(false);
      }
    }

    async function fetchCoursesAndVariants() {
      try {
        const { data: courses, error: cErr } = await supabase.from("courses").select("*");
        const { data: variants, error: vErr } = await supabase.from("course_variants").select("*");
        if (cErr || vErr) throw cErr || vErr;
        setCoursesData(
          courses.map((c) => ({
            ...c,
            variants: variants.filter((v) => v.course_id === c.id),
          }))
        );
      } catch {
        setCoursesError("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    }

    async function fetchCohortsAndVariants() {
      try {
        const { data: cohorts, error: cErr } = await supabase.from("cohorts").select("*");
        const { data: variants, error: vErr } = await supabase.from("cohort_variants").select("*");
        if (cErr || vErr) throw cErr || vErr;
        setCohortsData(
          cohorts.map((c) => ({
            ...c,
            variants: variants.filter((v) => v.cohort_id === c.id),
          }))
        );
      } catch {
        setCohortsError("Failed to load cohorts");
      } finally {
        setLoadingCohorts(false);
      }
    }

    async function fetchUserSubscription() {
      if (!currentUser?.id) {
        return;
      }
      try {
        const { data: subs, error: subsErr } = await supabase
          .from("user_subscriptions")
          .select("status")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (subsErr) throw subsErr;

        // If user has no subscription record, default to false
        if (!subs) {
          setIsSubscribed(false);
          return;
        }
        // Check subscription status
        setIsSubscribed(subs.status === "active" || subs.status === "trialing");
        
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setIsSubscribed(false);
      }
    }

    if (!loadingUser) {
      fetchUserSubscription();
      fetchUserEnrollments();
      fetchCohortEnrollments();
    }
    fetchCoursesAndVariants();
    fetchCohortsAndVariants();
  }, [currentUser, loadingUser]);

  // ----------- Helper Functions -----------

  function isVariantAlreadyEnrolled(type: "course" | "cohort", variantId: string) {
    return type === "course"
      ? enrolledCourseVariantIds.has(variantId)
      : enrolledCohortVariantIds.has(variantId);
  }

  async function getPhaseInfo(type: "course" | "cohort", variant: CourseVariantType | CohortVariantType): Promise<{ phase_name: string; phase_text: string } | null> {
    try {
      if (type == "course") {
        const { data: phase, error: phaseErr } = await supabase
          .from("course_phases")
          .select("phase_name, phase_text")
          .eq("variant_id", variant.id)
          .eq("is_active", true)
          .maybeSingle();

        if (phaseErr || !phase || !phase.phase_name) throw phaseErr || new Error("No active phase");
          return phase;

      } else if (type == "cohort") {
        const { data: phase, error: phaseErr } = await supabase
          .from("cohort_phases")
          .select("phase_name, phase_text")
          .eq("variant_id", variant.id)
          .eq("is_active", true)
          .maybeSingle();

        if (phaseErr || !phase || !phase.phase_name) throw phaseErr || new Error("No active phase");
          return phase;
      }
      else {
        return null;
      }

    } catch (err) {
      console.log("phaseerr:", err);
      return null;
    }
  }
  
  async function getPrice(type: "course" | "cohort", variant?: CourseVariantType | CohortVariantType) {
    if (!variant) return 0;

    const phase: { phase_name: string; phase_text: string } | null = await getPhaseInfo(type, variant);

    if (!phase) return 0;

    if (phase.phase_name === "phase_1") return variant.price_phase1;
    if (phase.phase_name === "phase_2") return variant.price_phase2;

    return 0;
  }

  async function handleSelectVariant(type: "course" | "cohort", parentId: string, variantId: string) {
     if (!isGlobalEnrollmentOpen) return;
     
    const parentData =
      type === "course"
        ? coursesData.find((c) => c.id === parentId)
        : cohortsData.find((c) => c.id === parentId);
    const variant = parentData?.variants.find((v) => v.id === variantId);
    if (!variant || !parentData) return;
    
    const variantPhase = await getPhaseInfo(type, variant);
    if (variantPhase?.phase_name !== "phase_1" && variantPhase?.phase_name !== "phase_2") return;

    if (isVariantAlreadyEnrolled(type, variantId)) {
      alert("You are already enrolled in this variant!");
      return;
    }

    const existingItem = cartItems.find(
      (i) => i.type === type && (i.courseId === parentId || i.cohortId === parentId) && i.variantId === variantId
    );

    if (existingItem) {
      handleRemoveItemFromCart(type, parentId, variantId);
      return;
    }

    const price = await getPrice(type, variant);

    const newItem: CartItemType = {
      type,
      courseId: type === "course" ? parentId : undefined,
      cohortId: type === "cohort" ? parentId : undefined,
      variantId,
      name: parentData.name,
      variantName: variant.name,
      price,
    };

    const newCartItems = [...cartItems, newItem];
    setCartItems(newCartItems);
  }

  function handleRemoveItemFromCart(type: "course" | "cohort" | "subscription", parentId?: string, variantId?: string) {
    const newCartItems = cartItems
      .filter(
        (i) =>
          !(
            i.type === type &&
            (i.courseId === parentId || i.cohortId === parentId) &&
            i.variantId === variantId
          )
      )
    setCartItems(newCartItems);
  }

  function handleClearCart() {
    setCartItems([]);
  }

  const paymentType = !isSubscribed ? "subscription": "one_time";
  const isPaymentComponentGloballyDisabled = loadingUser || !launchPhase || cartItems.length === 0;

  if (loadingCourses || loadingCourseEnrollments || loadingCohorts || loadingCohortEnrollments || loadingUser) {
    return (
      <section className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-3 h-6 w-40 bg-gray-700 rounded" />
          <p className="text-sm opacity-80">Loading pricing...</p>
        </div>
      </section>
    );
  }

  if (coursesError || courseEnrollmentsError || cohortsError || cohortEnrollmentsError) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <p>An Error Occured</p>
      </section>
    );
  }

  const activeCourse = coursesData.find((course) => course.id === activeCourseTab);
  const activeCohort = cohortsData.find((cohort) => cohort.id === activeCohortTab);

  return (
    <section className="min-h-screen">
      <header>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="max-w-md mx-auto">
            <LaunchTimer onPhaseChange={setLaunchPhase} />
          </div>
        </div>
      </header>
  
      <hr className="opacity-20" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">

            {/* --- Membership Card --- */}
            <div className="bg-[#1b1b27] rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Membership Access</h2>

              {/* ✅ [CHANGED #1] grid-cols-1 only + centered card */}
              <div className="grid grid-cols-1 place-items-center">
                <div
                  className={`bg-[#1b1b27] rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col transition-all duration-200
                    ${isSubscribed ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
                    border border-transparent hover:border-blue-400`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Full Membership</h3>
                    <span className="bg-yellow-500 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full">
                      Popular
                    </span>
                  </div>

                  <p className="text-sm opacity-80 mb-4">
                    Unlock every course, cohort, and workshop for an entire year.
                  </p>

                  {/* ✅ [CHANGED #2] Added more features (x3) */}
                  <ul className="space-y-2 mb-6">
                    {/* --- Learning Access --- */}
                    <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-400" /> Unlimited course access</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-400" /> All cohorts included</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-400" /> Priority workshop invites</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-400" /> Exclusive masterclasses</li>

                    {/* --- Community Perks --- */}
                    <li className="flex items-center gap-2 text-sm mt-2"><Check className="w-4 h-4 text-green-400" /> Private member community</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-400" /> Direct Q&A with instructors</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-400" /> Early access to new releases</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-400" /> Priority booking & front-row seating</li>

                    {/* --- Extra Benefits --- */}
                    <li className="flex items-center gap-2 text-sm mt-2"><Check className="w-4 h-4 text-green-400" /> Certificates for every course</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-400" /> Downloadable resources</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-400" /> Exclusive partner discounts</li>
                    <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-400" /> Lifetime content archive</li>
                  </ul>

                  {/* --- Price --- */}
                  <div className="text-center mb-6">
                    <p className="text-4xl font-bold text-white">£399</p>
                    <p className="text-sm text-gray-400 mt-1">Annual Access</p>
                  </div>

                  <button
                    onClick={() =>
                      setCartItems([
                        {
                          type: "subscription",
                          variantId: "membership-399",
                          name: "Full Membership",
                          variantName: "Access All Courses",
                          price: 399,
                        },
                      ])
                    }
                    disabled={isSubscribed}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 
                      ${
                        isSubscribed
                          ? "bg-green-600 text-white cursor-not-allowed opacity-70"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                  >
                    {isSubscribed ? "Already Subscribed" : "Subscribe £399"}
                  </button>
                </div>
              </div>
            </div>

            {/* cohorts */}
            <div className="mt-15 bg-[#1b1b27] rounded-xl shadow-md border border-[#2a2a3b] p-5 mb-10">
              <h2 className="text-3xl font-extrabold mb-4 text-white tracking-wide border-b border-[#2a2a3b] pb-2">Choose Your Cohorts</h2>
              <div className="w-full flex rounded-xl shadow-sm border border-gray-700">
                {cohortsData.map((cohort) => {
                  return (
                    <button
                      key={cohort.id}
                      onClick={() => setActiveCohortTab(cohort.id)}
                      className={`flex-1 text-center px-4 py-3 font-medium transition-all 
                        border-r border-gray-700 last:border-r-0 
                        whitespace-nowrap ${
                        activeCohortTab === cohort.id
                          ? `${cohort.color} shadow-lg transform scale-105`
                          : "bg-[#1b1b27]"
                      } ${
                        cohort.status === "inactive"
                          ? "pointer-events-none opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {cohort.status === "inactive" ? (
                        <span className="flex flex-col items-center justify-center">
                          {cohort.name}
                          <p className="text-xs text-gray-200">
                            Coming Soon...
                          </p>
                        </span>
                      ) : (
                        cohort.name
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeCohort && (
              <div className="bg-[#1b1b27] rounded-xl shadow-sm p-6 mb-8">
                <div className="flex items-center gap-2 mb-3 border-b border-[#2a2a3b] pb-2">
                  <div>
                    <h3 className="text-2xl font-bold">{activeCohort.name}</h3>
                    <p className="">{activeCohort.description}</p>
                  </div>
                </div>
              </div>
            )}

            {activeCohort && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {activeCohort.variants.map((variant) => (
                  <PricingCard
                    type="cohort"
                    key={variant.id}
                    variant={variant}
                    courseColor={activeCohort.color}
                    isSelected={cartItems.some((i) => i.type === "cohort" && i.variantId === variant.id)}
                    onSelect={() =>
                      handleSelectVariant("cohort", activeCohort.id, variant.id)
                    }
                    // Disable selection if enrollment is NOT open OR already enrolled
                    disabled={
                      !isSubscribed || !isGlobalEnrollmentOpen || isVariantAlreadyEnrolled("cohort", variant.id)
                    }
                    isAlreadyEnrolled={isVariantAlreadyEnrolled("cohort", variant.id)}
                    getPhaseInfo={getPhaseInfo}
                    getPrice={getPrice}
                  />
                ))}
              </div>
            )}
            {/*{!isEnrollmentOpen && (
              <div className="mt-8 p-4 bg-yellow-600 text-white rounded-lg text-center font-semibold">
                Cohort enrollment is currently {launchPhase}. You can still
                purchase membership if eligible!
              </div>
            )}*/}

            {/* Commented Course Section (keep for revert) */}
            <div className="mt-15 bg-[#1b1b27] rounded-xl shadow-md border border-[#2a2a3b] p-5 mb-10">
              <h2 className="text-3xl font-extrabold mb-4 text-white tracking-wide border-b border-[#2a2a3b] pb-2">Choose Your Courses</h2>
              <div className="w-full flex rounded-xl shadow-sm border border-gray-700">
                {coursesData.map((course) => {
                  return (
                    <button
                      key={course.id}
                      onClick={() => setActiveCourseTab(course.id)}
                      className={`flex-1 text-center px-4 py-3 font-medium transition-all 
                        border-r border-gray-700 last:border-r-0 
                        whitespace-nowrap ${
                        activeCourseTab === course.id
                          ? `${course.color} shadow-lg transform scale-105`
                          : "bg-[#1b1b27]"
                      } ${
                        course.status === "inactive"
                          ? "pointer-events-none opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {course.status === "inactive" ? (
                        <span className="flex flex-col items-center justify-center">
                          {course.name}
                          <p className="text-xs text-gray-200">
                            Coming Soon...
                          </p>
                        </span>
                      ) : (
                        course.name
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeCourse && (
              <div className="bg-[#1b1b27] rounded-xl shadow-sm p-6 mb-8">
                <div className="flex items-center gap-2 mb-3 border-b border-[#2a2a3b] pb-2">
                  <div>
                    <h3 className="text-2xl font-bold">{activeCourse.name}</h3>
                    <p className="">{activeCourse.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/*isEnrollmentOpen && (
              <div className="bg-[#1b1b27] border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-400 mb-2">
                  Selection Guidelines:
                </h4>
                <ul className="text-sm text-blue-400 space-y-1 list-disc px-3">
                  <li>Select up to 9 course variants from any courses</li>
                  <li>
                    {launchPhase === "phase1"
                      ? "Phase 1: 1st=£800, 2nd=£1500, 3rd=£2000 (Bundle)"
                      : "Phase 2: 1st=£1000, 2nd=£1600, 3rd=£2400"}
                  </li>
                  <li>
                    Pattern continues: 4th=£
                    {launchPhase === "phase1" ? "2800" : "3400"}, 5th=£
                    {launchPhase === "phase1" ? "3500" : "4000"}, 6th=£
                    {launchPhase === "phase1" ? "4000" : "4800"}, 7th=£
                    {launchPhase === "phase1" ? "4800" : "5800"}, 8th=£
                    {launchPhase === "phase1" ? "5500" : "6400"}, 9th=£
                    {launchPhase === "phase1" ? "6000" : "7200"}
                  </li>
                  <li>Current selections: {cartItems.length}</li>
                  <li>Mix and match variants from different courses</li>
                  <li>
                    {launchPhase === "phase1"
                      ? "Get 3 courses for £2000 in Phase 1!"
                      : "Consider tiered bundle discounts in Phase 2"}
                  </li>
                </ul>
              </div>
            )*/}

            {activeCourse && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {activeCourse.variants.map((variant) => (
                  <PricingCard
                    type="course"
                    key={variant.id}
                    variant={variant}
                    courseColor={activeCourse.color}
                    isSelected={cartItems.some((i) => i.type === "course" && i.variantId === variant.id)}
                    onSelect={() =>
                      handleSelectVariant("course", activeCourse.id, variant.id)
                    }
                    // Disable selection if enrollment is NOT open OR already enrolled
                    disabled={
                      !isSubscribed || !isGlobalEnrollmentOpen || isVariantAlreadyEnrolled("course", variant.id)
                    }

                    isAlreadyEnrolled={isVariantAlreadyEnrolled("course", variant.id)}
                    getPhaseInfo={getPhaseInfo}
                    getPrice={getPrice}
                  />
                ))}
              </div>
            )}
            
            {/*{!isEnrollmentOpen && (
              <div className="mt-8 p-4 bg-yellow-600 text-white rounded-lg text-center font-semibold">
                Course enrollment is currently {launchPhase}. You can still
                purchase membership if eligible!
              </div>
            )}*/}
          </div>
          
          {/* Cart + Payment */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Cart
                isSubscribed={isSubscribed}
                cartItems={cartItems}
                onRemoveItem={handleRemoveItemFromCart}
                onClearCart={handleClearCart}
                launchPhase={launchPhase}
                isCheckingOut={false}
                onCheckout={() => {}}
              />
              {currentUser && (
                <PaymentComponent
                  paymentType={paymentType}
                  user={currentUser}
                  cartItems={cartItems}
                  isGlobalEnrollmentOpen={isGlobalEnrollmentOpen}
                  isDisabled={isPaymentComponentGloballyDisabled}
                  currentLaunchPhase={launchPhase}
                />
              )}
              {!currentUser && !loadingUser && (
                <div className="mt-8 p-4 bg-red-600 text-white rounded-lg text-center font-semibold">
                  Please log in to proceed with enrollment.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}