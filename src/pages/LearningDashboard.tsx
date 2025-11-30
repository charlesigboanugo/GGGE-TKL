import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { courseModules, cohortSessions } from "@/constants/data";
import { BookOpen, Play, ChevronRight, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/supabase_client";
import { useUser } from "@/contexts/UserContext";

/* ---------------------------------- TYPES ---------------------------------- */

/*interface EnrollmentRecord {
  course_ids: string[];
  variant_ids: string[];
  stripe_checkout_session_id: string;
  created_at: string;
  total_price_paid: number;
}*/

interface CohortEnrollmentRecord {
  cohort_ids: string[];
  cohort_variant_ids: string[];
  /*stripe_checkout_session_id: string;
  created_at: string;
  total_price_paid: number;*/
}

export interface VariantType {
  id: string;
  name: string;
  description: string;
  duration: string;
  features: string[];
}

export interface CourseType {
  id: string;
  name: string;
  description: string;
  color: string;
  status: string;
  variants: VariantType[];
}

export interface CohortType {
  id: string;
  name: string;
  description: string;
  color: string;
  status: string;
  variants: VariantType[];
}

interface ModuleType {
  id: string;
  title: string;
  description: string;
  duration?: string;
  sub_module?: ModuleType[];
}

interface SessionType {
  id: string;
  title: string;
  description: string;
  duration?: string;
  sub_session?: SessionType[];
}

/*interface PurchasedVariant {
  courseId: string;
  variantId: string;
  courseName: string;
  variantName: string;
  courseColor: string;
}*/

interface PurchasedCohortVariant {
  cohortId: string;
  variantId: string;
  cohortName: string;
  variantName: string;
  cohortColor: string;
  fullProgram: boolean;
}

/* -------------------------- MODULE ITEM COMPONENT -------------------------- */
const ModuleItem = ({
  module,
  courseId,
  variantId,
  index,
  depth = 0,
}: {
  module: ModuleType;
  courseId: string;
  variantId: string;
  index: number;
  depth?: number;
}) => {
  const hasSubModules = module.sub_module && module.sub_module.length > 0;
  const paddingLeft = depth * 24;

  if (!hasSubModules) {
    return (
      <Link
        to={`/course-content/${courseId}/${variantId}/${module.id}`}
        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800 transition-colors border-b border-gray-700 last:border-b-0"
        style={{ paddingLeft: `${paddingLeft + 24}px` }}
      >
        <div className="flex items-center justify-center w-8 h-8 bg-blue-200 text-blue-700 rounded-full text-sm font-medium flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{module.title}</h4>
          <p className="text-sm text-gray-200 line-clamp-2">{module.description}</p>
        </div>
        {module.duration && (
          <div className="flex items-center gap-2 text-sm text-gray-200 flex-shrink-0">
            <Play className="w-4 h-4" />
            {module.duration}
          </div>
        )}
      </Link>
    );
  }

  return (
    <div className="border-b border-gray-700 last:border-b-0">
      <Accordion type="single" collapsible>
        <AccordionItem value={module.id} className="border-none">
          <AccordionTrigger
            className="px-6 py-4 hover:bg-gray-800 transition-colors [&[data-state=open]>div>svg]:rotate-90"
            style={{ paddingLeft: `${paddingLeft + 24}px` }}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center justify-center w-8 h-8 bg-green-200 text-green-700 rounded-full text-sm font-medium flex-shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h4 className="font-medium truncate">{module.title}</h4>
                <p className="text-sm text-gray-200 line-clamp-1">{module.description}</p>
                <span className="text-xs text-gray-400">{module.sub_module?.length} sub-modules</span>
              </div>
              {module.duration && (
                <div className="flex items-center gap-2 text-sm text-gray-200 flex-shrink-0 mr-4">
                  <Play className="w-4 h-4" />
                  {module.duration}
                </div>
              )}
              <ChevronRight className="w-4 h-4 transition-transform duration-200 flex-shrink-0" />
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <div className="bg-gray-900/50">
              {module.sub_module?.map((sub, i) => (
                <ModuleItem
                  key={sub.id}
                  module={sub}
                  courseId={courseId}
                  variantId={variantId}
                  index={i}
                  depth={depth + 1}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

/*---------------------------helper-----------------------------------------------*/
const getStatus = (start: Date, end: Date, now: Date) => {
  if  (!start || !end) return { label: "TBA", color: "bg-gray-600" };
  if (now < start) return { label: "Upcoming", color: "bg-blue-600" };
  if (now > end) return { label: "Ended", color: "bg-gray-600" };
  return { label: "Live", color: "bg-red-600" };
};


/* -------------------------- SESSION ITEM COMPONENT -------------------------- */
const SessionItem = ({
  session,
  cohortId,
  variantId,
  index,
  depth = 0,
  sessionDates,
}: {
  session: SessionType;
  cohortId: string;
  variantId: string;
  index: number;
  depth?: number;
  sessionDates: Record<string, {session_start_time: Date, session_end_time: Date}>;
}) => {
  const hasSubSessions = session.sub_session && session.sub_session.length > 0;
  const paddingLeft = depth * 24;
  const start = sessionDates[session.id]?.session_start_time;
  const end = sessionDates[session.id]?.session_end_time;
  const status = (!start || !end) ? {label: "TBA", color: "bg-gray-600"} : getStatus(new Date(start), new Date(end), new Date());

  if (!hasSubSessions) {
    return (
      <Link
        to={`/cohort-content/${cohortId}/${variantId}/${session.id}`}
        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800 transition-colors border-b border-gray-700 last:border-b-0"
        style={{ paddingLeft: `${paddingLeft + 24}px` }}
      >
        <div className="flex items-center justify-center w-8 h-8 bg-blue-200 text-blue-700 rounded-full text-sm font-medium flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{session.title}</h4>
          <p className="text-sm text-gray-200 line-clamp-2">{session.description}</p>
          <span className="text-sm text-white-400">
            {(status.label === "Upcoming" || status.label === "Ended") &&
              (status.label === "Upcoming" ? 
                new Date(start).toLocaleString() : new Date(end).toLocaleString()
              )
            }
          </span>
        </div>

        <span
          className={`text-xs mx-2 px-2 py-1 rounded-md text-white ${status.color}`}
        >
          {status.label}
        </span>

        {session.duration && (
          <div className="flex items-center gap-2 text-sm text-gray-200 flex-shrink-0">
            <Play className="w-4 h-4" />
            {session.duration}
          </div>
        )}
      </Link>
    );
  }

  return (
    <div className="border-b border-gray-700 last:border-b-0">
      <Accordion type="single" collapsible>
        <AccordionItem value={module.id} className="border-none">
          <AccordionTrigger
            className="px-6 py-4 hover:bg-gray-800 transition-colors [&[data-state=open]>div>svg]:rotate-90"
            style={{ paddingLeft: `${paddingLeft + 24}px` }}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center justify-center w-8 h-8 bg-green-200 text-green-700 rounded-full text-sm font-medium flex-shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h4 className="font-medium truncate">{session.title}</h4>
                <p className="text-sm text-gray-200 line-clamp-1">{session.description}</p>
                <span className="text-xs text-gray-400">{session.sub_session?.length} sub-modules</span>
              </div>
              {session.duration && (
                <div className="flex items-center gap-2 text-sm text-gray-200 flex-shrink-0 mr-4">
                  <Play className="w-4 h-4" />
                  {session.duration}
                </div>
              )}
              <ChevronRight className="w-4 h-4 transition-transform duration-200 flex-shrink-0" />
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <div className="bg-gray-900/50">
              {session.sub_session?.map((sub, i) => (
                <SessionItem
                  key={sub.id}
                  session={sub}
                  cohortId={cohortId}
                  variantId={variantId}
                  index={i}
                  depth={depth + 1}
                  sessionDates={sessionDates}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};


/* ---------------------------- MAIN DASHBOARD ---------------------------- */
export default function LearningDashboard() {
  const { currentUser, loadingUser } = useUser();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSub, setLoadingSub] = useState(true);

  const [allCoursesData, setAllCoursesData] = useState<CourseType[]>([]);
  //const [purchasedVariants, setPurchasedVariants] = useState<PurchasedVariant[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const [allCohortsData, setAllCohortsData] = useState<CohortType[]>([]);
  const [purchasedCohortVariants, setPurchasedCohortVariants] = useState<PurchasedCohortVariant[]>([]);
  const [loadingCohorts, setLoadingCohorts] = useState(true);
  const [cohortsError, setCohortsError] = useState<string | null>(null);
  const [activeCohortTab, setActiveCohortTab] = useState<string | null>(null);

  const [sessionDates, setSessionDates] = useState<Record<string, {session_start_time: Date, session_end_time: Date}>>({});
  const [loadingSessionDates, setLoadingSessionDates] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  /*---------------- Subscription Check ----------------*/
  useEffect(() => {
    async function checkSubscription() {
      if (!currentUser?.id) {
        setLoadingSub(false);
        return;
      }
      const { data } = await supabase
        .from("user_subscriptions")
        .select("status")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (data?.status === "active" || data?.status === "trialing" || data?.status === "past_due" || data?.status === "unpaid") {
        setIsSubscribed(true);
      }
      setActiveTab(allCoursesData[0]?.id);
      setLoadingSub(false);
    }
    if (!loadingUser) checkSubscription();
  }, [currentUser, loadingUser, allCoursesData]);

  /* ---------------------- FETCH ALL COURSES + VARIANTS ---------------------- */
  useEffect(() => {
    async function fetchCourses() {
      setLoadingCourses(true);
      try {
        const { data: courses, error: courseErr } = await supabase.from("courses").select("*");
        if (courseErr) throw courseErr;

        const { data: variants, error: varErr } = await supabase.from("course_variants").select("*");
        if (varErr) throw varErr;

        const mapped = courses.map((c) => ({
          ...c,
          variants: variants.filter((v) => v.course_id === c.id),
        }));
        setAllCoursesData(mapped);
      } catch (err) {
        //console.error("Error fetching all courses or variants:", err);
        setCoursesError("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchCourses();
  }, []);

  /* ---------------------- FETCH ALL COHORTS + VARIANTS ---------------------- */
  useEffect(() => {
    async function fetchCohorts() {
      setLoadingCohorts(true);
      try {
        const { data: cohorts, error: cohortErr } = await supabase.from("cohorts").select("*");
        if (cohortErr) throw cohortErr;

        const { data: variants, error: varErr } = await supabase.from("cohort_variants").select("*");
        if (varErr) throw varErr;

        const mapped = cohorts.map((c) => ({
          ...c,
          variants: variants.filter((v) => v.cohort_id === c.id),
        }));
        setAllCohortsData(mapped);
      } catch (err) {
        //console.error("Error fetching all cohort or variants:", err);
        setCohortsError("Failed to load cohorts");
      } finally {
        setLoadingCohorts(false);
      }
    }
    fetchCohorts();
  }, []);

  /* ---------------------- FETCH ALL SESSIONS START AND END DATE ---------------------- */
  useEffect(() => {
    async function fetchSessionDates() {
      setLoadingSessionDates(true);
      try {
        const { data: sessionDates, error: sesErr } = await supabase
          .from("cohort_content")
          .select("session_id, session_start_time, session_end_time");
        if (sesErr) throw sesErr;

        const mappedDates = sessionDates.reduce((acc, s) => {
            acc[s.session_id] = {
              session_start_time: s.session_start_time,
              session_end_time: s.session_end_time,
            };
            return acc;
          }, {} as Record<string, { session_start_time: Date; session_end_time: Date}>)
      
      setSessionDates(mappedDates);

      } catch (err) {
        //console.error("Error fetching session dates:", err);
        setSessionError("Failed to load session contents");
      } finally {
        setLoadingSessionDates(false);
      }
    }
    fetchSessionDates();
  }, []);

  /* ---------------------- FETCH USER COURSE ENROLLMENTS ---------------------- */
  /*useEffect(() => {
    async function fetchEnrollments() {
      if (!currentUser?.id || allCoursesData.length === 0) return;

      try {
        const { data: enrolls, error } = await supabase
          .from("enrollments")
          .select("course_ids, variant_ids")
          .eq("user_id", currentUser.id)
          .eq("status", "completed");
        if (error) throw error;

        const newPurchased: PurchasedVariant[] = [];
        enrolls.forEach((e: EnrollmentRecord) => {
          e.course_ids.forEach((cid, i) => {
            const vid = e.variant_ids[i];
            const course = allCoursesData.find((c) => c.id === cid);
            const variant = course?.variants.find((v) => v.id === vid);
            if (course && variant) {
              newPurchased.push({
                courseId: course.id,
                variantId: variant.id,
                courseName: course.name,
                variantName: variant.name,
                courseColor: course.color,
              });
            }
          });
        });

        setPurchasedVariants(newPurchased);
        if (!activeTab && newPurchased.length > 0) //setActiveTab(newPurchased[0].courseId);
      } catch (err) {
        console.error("Error fetching user course enrollments:", err);
        setCoursesError("Failed to load user enrollments");
      }
    }

    if (!loadingUser && !loadingCourses) fetchEnrollments();
  }, [currentUser, loadingUser, allCoursesData, loadingCourses, activeTab]);
  */

  /* ---------------------- FETCH USER COHORT ENROLLMENTS ---------------------- */
  useEffect(() => {
    async function fetchCohortEnrollments() {
      if (!currentUser?.id || allCohortsData.length === 0) return;

      try {
        const { data: enrolls, error } = await supabase
          .from("cohort_enrollments")
          .select("cohort_ids, cohort_variant_ids")
          .eq("user_id", currentUser.id)
          .eq("status", "completed");
        if (error) throw error;

        const newPurchased: PurchasedCohortVariant[] = [];
        enrolls.forEach((e: CohortEnrollmentRecord) => {
          e.cohort_ids.forEach((cid, i) => {
            const purchasedVariantId = e.cohort_variant_ids[i];
            const cohort = allCohortsData.find((c) => c.id === cid);
            if (!cohort) return;

            // If "full_program" is purchased, add all variants
            if (purchasedVariantId === "full_program") {
              cohort.variants.forEach((v) => {
                if (v.id === "full_program") return; // skip full_program variant itself
                newPurchased.push({
                  cohortId: cohort.id,
                  variantId: v.id,
                  cohortName: cohort.name,
                  variantName: v.name,
                  cohortColor: cohort.color,
                  fullProgram: true,
                });
              });
            } else {
              const variant = cohort?.variants.find((v) => v.id === purchasedVariantId);
              if (cohort && variant) {
                newPurchased.push({
                  cohortId: cohort.id,
                  variantId: variant.id,
                  cohortName: cohort.name,
                  variantName: variant.name,
                  cohortColor: cohort.color,
                  fullProgram: false,
                });
              }
            }
          });
        });

        setPurchasedCohortVariants(newPurchased);
        if (!activeCohortTab && newPurchased.length > 0)
          setActiveCohortTab(newPurchased[0].cohortId);
      } catch (err) {
        //console.error("Error fetching user cohort enrollments:", err);
        setCohortsError("Failed to load user cohort enrollments");
      }
    }

    if (!loadingUser && !loadingCohorts) fetchCohortEnrollments();
  }, [currentUser, loadingUser, allCohortsData, loadingCohorts, activeCohortTab]);

  //console.log("Cohort Dates:", sessionDates["basic_steps"]);

   /* ------------------------------ UTILITIES ------------------------------ */
  const countTotalModules = (modules: ModuleType[]): number =>
    modules.reduce(
      (count, m) => count + 1 + (m.sub_module ? countTotalModules(m.sub_module) : 0),
      0
    );

  const countTotalSessions = (sessions: SessionType[]): number =>
    sessions.reduce(
      (count, s) => count + 1 + (s.sub_session ? countTotalSessions(s.sub_session) : 0),
      0
    );

  if (loadingCourses || loadingCohorts || loadingUser || loadingSub || loadingSessionDates){
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-3 h-6 w-40 bg-gray-700 rounded" />
          <p className="text-sm opacity-80">Loading learning dashboard...</p>
        </div>
      </div>
    );
  }
  if (coursesError || cohortsError || sessionError)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {coursesError || cohortsError}
      </div>
    );

  /* ----------------------------- RENDER UI ----------------------------- */
  return (
    <div className="min-h-screen">
      <header className="shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Learning Dashboard</h1>
          <p className="mt-1">Access all your enrolled Courses and Cohorts</p>
        </div>
      </header>

      <hr className="opacity-20" />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* --------------------------- COURSES SECTION --------------------------- */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">My Courses</h2>

          {// course access is controlled by individual course variant purchases
          /*{purchasedVariants.length === 0 ? (*/}
          
          {/* subscription controls course access*/}
          {!isSubscribed ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Subscribe to Access Courses</h3>
              <p className="text-gray-200 mb-4">
                Subscribe to unlock all courses and start learning today.
              </p>
              <Link
                to="/course-buying-page"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </Link>
            </div>
          ) : (
            <>
              {/* ---------------------------- COURSE TABS ---------------------------- */}
              <div className="w-full flex overflow-x-auto rounded-xl shadow-sm border border-gray-700">

              {/* use if subscription does not give access to courses*/}
              {/* {allCoursesData
                  .filter((c) =>
                    purchasedVariants.some((p) => p.courseId === c.id)
                  )
                  .map((course) => (*/}

              {/* Allow all courses if subscribed*/}
                {allCoursesData.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setActiveTab(course.id)}
                    className={`
                      flex-1 text-center px-4 py-3 font-medium transition-all 
                      border-r border-gray-700 last:border-r-0 
                      whitespace-nowrap 
                      ${
                        activeTab === course.id
                          ? `${course.color} text-white`
                          : "bg-gray-900 text-gray-300 hover:bg-gray-800"
                      }
                    `}
                    style={{ minWidth: `${100 / allCoursesData.length}%` }}
                  >
                    {course.name}
                  </button>
                ))}
              </div>

              {/* ---------------------------- COURSE CONTENT ---------------------------- */}
              {activeTab &&
                allCoursesData
                  .filter((c) => c.id === activeTab)
                  .map((course) => (

                    /*const purchasedLevels = purchasedVariants.filter(
                      (pv) => pv.courseId === course.id
                    );*/
                    
                    <Accordion key={course.id} type="single" collapsible className="space-y-4 mt-6">
                      {/*purchasedLevels*/ course.variants.map((level) => {
                        const modules = courseModules[course.id]?.[level.id /*variantId*/] || [];
                        const total = countTotalModules(modules);

                        return (
                          <AccordionItem
                            key={level.id /*variantId*/}
                            value={level.id /*variantId*/}
                            className="border border-gray-700 rounded-lg overflow-hidden"
                          >
                            <AccordionTrigger className="px-6 py-4 hover:bg-gray-800">
                              <div className="flex justify-between w-full">
                                <span className="font-semibold">{level.name /*variantName*/}</span>
                                <span className="text-sm opacity-75">{total} lessons</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="border-t border-gray-700 bg-gray-900">
                                {modules.map((m, i) => (
                                  <ModuleItem
                                    key={m.id}
                                    module={m}
                                    courseId={course.id}
                                    variantId={level.id /*variantId*/}
                                    index={i}
                                  />
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  ))}
            </>
          )}
        </section>

        {/* --------------------------- COHORTS SECTION --------------------------- */}
        <section>
          <h2 className="text-2xl font-bold mb-6">My Cohorts</h2>

          {purchasedCohortVariants.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Cohorts Enrolled</h3>
              <p className="text-gray-200 mb-4">Explore our cohort programs to join the next session.</p>
              <Link
                to="/course-buying-page"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View Cohorts
              </Link>
            </div>
          ) : (
            <>
              {/* ---------------------------- COHORT TABS ---------------------------- */}
              <div className="w-full flex overflow-x-auto rounded-xl shadow-sm border border-gray-700">
                {allCohortsData
                  .filter((c) => purchasedCohortVariants.some((p) => p.cohortId === c.id))
                  .map((cohort) => {
                    const hasFullProgram = purchasedCohortVariants.some(
                      (p) => p.cohortId === cohort.id && p.fullProgram
                    );

                    return (
                      <button
                        key={cohort.id}
                        onClick={() => setActiveCohortTab(cohort.id)}
                        className={`
                          flex-1 text-center px-4 py-3 font-medium transition-all 
                          border-r border-gray-700 last:border-r-0 
                          whitespace-nowrap
                          ${
                            activeCohortTab === cohort.id
                              ? `${cohort.color} text-white`
                              : "bg-gray-900 text-gray-300 hover:bg-gray-800"
                          }
                        `}
                        style={{
                          minWidth: `${
                            100 /
                            purchasedCohortVariants.filter((p) => p.cohortId === cohort.id).length
                          }%`,
                        }}
                      >
                        <span>{cohort.name}</span>
                        {hasFullProgram && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full ml-2">
                            Full Program
                          </span>
                        )}
                      </button>
                    );
                  })}   
              </div>

              {/* ---------------------------- COHORT CONTENT ---------------------------- */}
              {activeCohortTab &&
                allCohortsData
                  .filter((c) => c.id === activeCohortTab)
                  .map((cohort) => {
                    const purchasedLevels = purchasedCohortVariants.filter(
                      (pv) => pv.cohortId === cohort.id
                    );

                    return (
                      <Accordion
                        key={cohort.id}
                        type="single"
                        collapsible
                        className="space-y-4 mt-6"
                      >
                        {purchasedLevels.map((level) => {
                          const sessions = cohortSessions[cohort.id]?.[level.variantId] || [];
                          const total = countTotalSessions(sessions);

                          return (
                            <AccordionItem
                              key={level.variantId}
                              value={level.variantId}
                              className="border border-gray-700 rounded-lg overflow-hidden"
                            >
                              <AccordionTrigger className="px-6 py-4 hover:bg-gray-800">
                                <div className="flex justify-between w-full">
                                  <span className="font-semibold">{level.variantName}</span>
                                  <span className="text-sm opacity-75">{total} sessions</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="border-t border-gray-700 bg-gray-900">
                                  {sessions.map((s, i) => (
                                    <SessionItem
                                      key={s.id}
                                      session={s}
                                      cohortId={cohort.id}
                                      variantId={level.variantId}
                                      index={i}
                                      sessionDates={sessionDates}
                                    />
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    );
                  })}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
