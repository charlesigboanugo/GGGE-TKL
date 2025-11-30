import { toast } from "react-hot-toast"; // optional: for notifications

import { useEffect, useState } from "react";
import { supabase } from "@/supabase_client";
import { useUser } from "@/contexts/UserContext";
import { Link } from "react-router-dom";
import { BookOpen, Users, Calendar, CreditCard } from "lucide-react";

/**
 * Upgraded Membership Dashboard
 * - Shows membership status (active/trial/inactive)
 * - If subscribed: shows ALL courses & cohorts unlocked
 * - If not subscribed: shows only enrolled variants and encourages upgrade
 * - Mobile-first, responsive layout using Tailwind CSS
 * - Includes quick actions: Manage subscription (if available), Go to buying page
 */

type CourseVariant = any;
type Course = { id: string; name: string; description?: string; color?: string; variants?: CourseVariant[] };
type CohortVariant = any;
type Cohort = { id: string; name: string; description?: string; color?: string; variants?: CohortVariant[] };

export default function DashboardMembership() {
  const { currentUser } = useUser();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  //const [enrolledVariantIds, setEnrolledVariantIds] = useState<Set<string>>(new Set());
  const [enrolledCohortVariantIds, setEnrolledCohortVariantIds] = useState<Set<string>>(new Set());

  const [subStatus, setSubStatus] = useState<string | null>(null);
  
  // =================== CHANGES MADE: NEW STATE ===================
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false); // tracks autorenew status
  const [isToggling, setIsToggling] = useState(false); // prevents double click
  const [isLoadingPortal, setIsLoadingPortal] = useState(false); // loading state for billing portal
  // ===============================================================

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoading(true);
      try {
        // fetch courses and variants
        const [{ data: coursesData, error: cErr }, { data: courseVariants, error: cvErr }] = await Promise.all([
          supabase.from("courses").select("*").order("name", { ascending: true }),
          supabase.from("course_variants").select("*")
        ]);
        if (cErr || cvErr) throw cErr || cvErr;

        const coursesMapped: Course[] = (coursesData || []).map((c: any) => ({
          ...c,
          variants: (courseVariants || []).filter((v: any) => v.course_id === c.id)
        }));

        // fetch cohorts and variants
        const [{ data: cohortsData, error: cohErr }, { data: cohortVariants, error: chvErr }] = await Promise.all([
          supabase.from("cohorts").select("*").order("name", { ascending: true }),
          supabase.from("cohort_variants").select("*")
        ]);
        if (cohErr || chvErr) throw cohErr || chvErr;

        const cohortsMapped: Cohort[] = (cohortsData || []).map((c: any) => ({
          ...c,
          variants: (cohortVariants || []).filter((v: any) => v.cohort_id === c.id)
        }));

        // fetch course enrollments (variant ids)
       /* const enrolledSet = new Set<string>();
        if (currentUser?.id) {
          const { data: enrollments } = await supabase
            .from("enrollments")
            .select("variant_ids")
            .eq("user_id", currentUser.id);

          (enrollments || []).forEach((row: any) => {
            if (Array.isArray(row.variant_ids)) {
              row.variant_ids.forEach((id: string) => enrolledSet.add(id));
            }
          });
        }*/

        // fetch cohort enrollments (variant ids)
        const enrolledCohortSet = new Set<string>();
        if (currentUser?.id) {
          const { data: enrollments } = await supabase
            .from("cohort_enrollments")
            .select("cohort_variant_ids")
            .eq("user_id", currentUser.id);

          (enrollments || []).forEach((row: any) => {
            if (Array.isArray(row.cohort_variant_ids)) {
              row.cohort_variant_ids.forEach((id: string) => enrolledCohortSet.add(id));
            }
          });
        }

        // fetch subscription status
        // =================== CHANGES MADE: FETCH cancel_at_period_end ===================
        if (currentUser?.id) {
          const { data: subs } = await supabase
            .from("user_subscriptions")
            .select("status, current_period_end, cancel_at_period_end")
            .eq("user_id", currentUser.id)
            .maybeSingle();

          if (subs) {
            setSubStatus(subs.status);
            setCancelAtPeriodEnd(!!subs.cancel_at_period_end);
          } else {
            setSubStatus(null);
            setCancelAtPeriodEnd(false);
          }
        }
        // ===============================================================

        if (!mounted) return;
        setCourses(coursesMapped);
        setCohorts(cohortsMapped);
        //setEnrolledVariantIds(enrolledSet);
        setEnrolledCohortVariantIds(enrolledCohortSet);
        setError(null);
      } catch (err: any) {
        //console.error("DashboardMembership load error", err);
        setError("Failed to load membership data. Try refreshing.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  //const isSubscribed = subStatus === "active" || subStatus === "trialing";
  const isSubscribed = ["active", "trialing", "past_due", "unpaid"].includes(subStatus || "");

  /*function isVariantEnrolled(variantId?: string) {
    if (!variantId) return false;
    return enrolledVariantIds.has(variantId);
  }*/

  function isCohortVariantEnrolled(variantId?: string) {
    if (!variantId) return false;
    return enrolledCohortVariantIds.has(variantId);
  }

  const visibleCourses = isSubscribed ? courses : [];
  const visibleCohorts = isSubscribed ? cohorts : [];

  // =================== NEW: FULL PROGRAM AUTO-UNLOCK LOGIC ===================
  function hasFullProgram() {
    return enrolledCohortVariantIds.has("full_program");
  }

  function isCohortVariantUnlocked(variantId?: string) {
    if (!variantId) return false;
    if (hasFullProgram()) return true; // full program unlocks ALL
    return isCohortVariantEnrolled(variantId);
  }

  // =================== CHANGES MADE: TOGGLE BUTTON HANDLER ===================
  async function handleToggleSubscription() {
    if (!currentUser?.email) return;
    setIsToggling(true);
    try {
      const { data, error } = await supabase.functions.invoke("toggle-subscription", {
        body: { email: currentUser.email } // backend determines subscription
      });

      if (error) throw error;
      // toggle local state for instant UI feedback
      setCancelAtPeriodEnd(prev => !prev);
      toast.success(data?.message || "Subscription updated successfully");
    } catch (err) {
      //console.error(err);
      toast.error("Failed to update subscription. Try again.");
    } finally {
      setIsToggling(false);
    }
  }
  // ===============================================================

  async function handleOpenBillingPortal() {
    if (isLoadingPortal) return; // prevent multiple clicks
    setIsLoadingPortal(true);
    try {
      const { data } = await supabase.functions.invoke("create-billing-portal", { body: {}});
      if (data && (data as any).url) {
        window.open((data as any).url, "_blank");
      } else {
        toast.error("Could not open billing portal. Please visit the Billing page in your account.");
      }
    } catch (err) {
      //console.error(err);
      toast.error("Billing portal is not configured. Contact support.");
    } finally {
      setIsLoadingPortal(false);
    }
    
  }

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-3 h-6 w-40 bg-gray-700 rounded" />
          <p className="text-sm opacity-80">Loading your membership...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-4 sm:px-8 py-8 max-w-7xl mx-auto">
      {/* HERO */}
      <div className="bg-gradient-to-r from-slate-900 to-[#0b1220] rounded-2xl p-6 md:p-8 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center">
              <Users className="w-8 h-8 text-white/90" />
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">Membership Dashboard</h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              {isSubscribed ? (
                <>
                  You have <span className="font-semibold">Full access</span> to all courses, cohorts and workshops. Enjoy unlimited learning — evergreen content included.
                </>
              ) : (
                <>
                  You are not an active member. <span className="font-semibold">Subscribe</span> to unlock every course with a single annual payment.
                </>
              )}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {isSubscribed ? (
                <>
                  {/* =================== CHANGES MADE: SINGLE TOGGLE BUTTON =================== */}
                  { subStatus === "active" && (
                    <button 
                      onClick={handleToggleSubscription} 
                      disabled={isToggling}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium
                        ${isToggling ? 'bg-gray-500 cursor-not-allowed' : 'bg-white/6 hover:bg-white/10'}`}
                    >
                      <CreditCard className="w-4 h-4" />
                      {isToggling 
                        ? cancelAtPeriodEnd 
                          ? "Resuming..." 
                          : "Cancelling..." 
                        : cancelAtPeriodEnd 
                          ? "Resume Subscription" 
                          : "Cancel Auto-Renew"
                      }
                    </button>
                  )}
                  {/* =============================================================== */}

                  {/* --- ALTERNATIVE: Stripe Billing Portal --- */}
                  <button
                    onClick={handleOpenBillingPortal}
                    disabled={isLoadingPortal}
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-white/6 rounded-md font-medium 
                      ${isToggling ? 'bg-gray-500 cursor-not-allowed' : 'bg-white/6 hover:bg-white/10'} hover:bg-white/10`}
                  >
                    <CreditCard className="w-4 h-4" /> {isLoadingPortal ? "Loading..." : "Manage subscription"}
                  </button>

                  <Link to="/pricing-page" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-md font-medium hover:bg-blue-500">
                    <BookOpen className="w-4 h-4" /> Browse courses
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/pricing-page" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 rounded-md font-medium hover:bg-amber-400">
                    <Users className="w-4 h-4" /> Get Membership
                  </Link>

                  <Link to="/pricing-page" className="inline-flex items-center gap-2 px-4 py-2 bg-white/6 rounded-md font-medium hover:bg-white/10">
                    <BookOpen className="w-4 h-4" /> View buying options
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-2 md:mt-0 flex-shrink-0 text-right">
            <div className="inline-block bg-white/5 px-4 py-2 rounded-lg">
              <div className="text-xs text-slate-300">Status</div>
              <div className={`mt-1 font-semibold ${isSubscribed ? "text-emerald-300" : "text-amber-300"}`}>{isSubscribed ? "Active Member" : "Free / Guest"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-white/6">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-slate-300">Courses visible</div>
            <div className="font-semibold text-lg">{isSubscribed ? courses.length : visibleCourses.length}</div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-white/6">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-slate-300">Cohorts visible</div>
            <div className="font-semibold text-lg">{isSubscribed ? cohorts.length : visibleCohorts.length}</div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-white/6">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-slate-300">Membership</div>
            <div className="font-semibold text-lg">
              {subStatus === "active" && !cancelAtPeriodEnd && "Active Member"}
              {subStatus === "active" && cancelAtPeriodEnd && "Active (will cancel at period end)"}
              {subStatus === "trialing" && "Trialing"}
              {subStatus === "past_due" && "Payment overdue – please update your card to avoid cancellation"}
              {subStatus === "unpaid" && "Payment failed – subscription would be cancelled soon, update your payment to reactivate"}
              {isSubscribed ? "" : "Not Subscribed"}
            </div>
          </div>
        </div>
      </div>

      {/* COURSES + COHORTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Courses</h3>
            {!isSubscribed && (
              <Link to="/pricing-page" className="text-sm text-amber-400">Upgrade to unlock all</Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {visibleCourses.length === 0 && (
              <div className="bg-white/5 p-6 rounded-lg">No courses available yet.</div>
            )}

            {visibleCourses.map((course) => (
              <article key={course.id} className="bg-white/6 p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{course.name}</h4>
                    <p className="text-xs text-slate-300 mt-1">{course.description || "—"}</p>
                  </div>
                  <div className="text-xs text-slate-400">{course.variants?.length || 0} variants</div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  {(course.variants || []).slice(0, 4).map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between bg-white/5 p-2 rounded">
                      <div className="text-sm">
                        <div className="font-medium">{v.name}</div>
                        <div className="text-xs text-slate-300">{v.duration || v.total_hours || ""}</div>
                      </div>

                      <div className="text-right">
                        {isSubscribed && (
                            <div className="text-emerald-300 text-sm">Unlocked</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Link to='/learning-dashboard' className="text-sm text-slate-300">View More</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Cohorts</h3>
            {!isSubscribed && (
              <Link to="/pricing-page" className="text-sm text-amber-400">Upgrade to unlock all</Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {visibleCohorts.length === 0 && (
              <div className="bg-white/5 p-6 rounded-lg">No cohorts available yet.</div>
            )}

            {visibleCohorts.map((cohort) => (
              <article key={cohort.id} className="bg-white/6 p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{cohort.name}</h4>
                    <p className="text-xs text-slate-300 mt-1">{cohort.description || "—"}</p>
                  </div>
                  <div className="text-xs text-slate-400">{cohort.variants?.length || 0} variants</div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  {(cohort.variants || []).slice(0, 4).map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between bg-white/5 p-2 rounded">
                      <div className="text-sm">
                        <div className="font-medium">{v.name}</div>
                        <div className="text-xs text-slate-300">{v.cohort_dates ? v.cohort_dates.join(", ") : v.time_slot || ""}</div>
                      </div>

                      <div className="text-right">
                        {isCohortVariantUnlocked(v.id) ? (
                          <div className="text-emerald-300 text-sm">unlocked</div>
                        ) : (
                          <Link to="/pricing-page" className="text-sm text-amber-400">Enroll</Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Link to='/learning-dashboard' className="text-sm text-slate-300">View More</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER CTA */}
      <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-[#021025] to-[#061026] flex flex-col sm:flex-row items-center justify-between gap-4">
        {!isSubscribed && (
          <div>
            <div className="text-sm text-slate-300">Want full permanent access?</div>
            <div className="font-semibold">Subscribe and unlock everything — one low price.</div>
          </div>
        )}
        <div className="flex gap-3">
          {!isSubscribed && <Link to="/pricing-page" className="px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 font-medium">Get membership</Link>}
          <Link to="/" className="px-4 py-2 rounded-md border border-white/10">Back to home</Link>
        </div>
      </div>

      {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
    </section>
  );
}
