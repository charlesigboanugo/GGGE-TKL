// Enhanced CohortContent.tsx with Option A features added (non-destructive)
// --- FULL REGENERATED FILE BELOW ---

import {  
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cohortSessions, cohorts } from "@/constants/data";
import { useUser } from "@/contexts/UserContext";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Play,
  ChevronRight,
  Layers,
  BookOpen,
  Calendar,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback} from "react";
import { supabase } from "@/supabase_client";

// Types: Session replaces Module, sub_session replaces sub_module
type SessionType = {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  sub_session?: SessionType[];
  session_start_time: Date;
  session_end_time: Date;
};

type CohortSessionsType = Record<string, Record<string, SessionType[]>>;

// Flatten helper
const flattenSessions = (sessions: SessionType[]): SessionType[] => {
  const flattened: SessionType[] = [];

  const traverse = (list: SessionType[]) => {
    list.forEach((s) => {
      if (s.sub_session && s.sub_session.length > 0) {
        traverse(s.sub_session);
      } else {
        flattened.push(s);
      }
    });
  };

  traverse(sessions);
  return flattened;
};

const getStatus = (start: Date, end: Date, now: Date) => {
  if (now < start) return { label: "Upcoming", color: "bg-blue-600" };
  if (now > end) return { label: "Ended", color: "bg-gray-600" };
  return { label: "Live", color: "bg-red-600" };
};


// Recursive Sidebar Item component
const SessionItem = ({
  session,
  cohortID,
  cohort_variant,
  sessionID,
  index,
  depth = 0,
  timing,
}: {
  session: SessionType;
  cohortID: string;
  cohort_variant: string;
  sessionID: string;
  index: number;
  depth?: number;
  timing: Record<string, {session_start_time: Date, session_end_time: Date}>;
}) => {
  const hasSubSessions = session.sub_session && session.sub_session.length > 0;
  const paddingLeft = depth * 16;
  const isActive = session.id === sessionID;

  const hasActiveSubSession = session.sub_session?.some((sub) => {
    const checkActive = (s: SessionType): boolean => {
      if (s.id === sessionID) return true;
      if (s.sub_session) {
        return s.sub_session.some(checkActive);
      }
      return false;
    };
    return checkActive(sub);
  });

  if (!hasSubSessions) {
    return (
      <Link
        to={`/cohort-content/${cohortID}/${cohort_variant}/${session.id}`}
        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          isActive ? "bg-blue-800 text-white" : "hover:bg-gray-700 text-gray-200"
        }`}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
      >
        <div
          className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
            isActive ? "bg-blue-500 text-white" : "bg-gray-600 text-gray-200"
          }`}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">

          {/* STATUS TAG */}
            {(() => {
              const start = new Date(timing[session.id].session_start_time);
              const end = new Date(timing[session.id].session_end_time);
              const status = getStatus(start, end, new Date());

              return (
                <>
                  <div className="font-medium text-sm truncate">{session.title}
                    <span
                      className={`text-xs mx-2 px-2 py-1 rounded-md text-white ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <span className="text-sm text-white-400">
                    {(status.label === "Upcoming" || status.label === "Ended") &&
                      (status.label === "Upcoming" ? 
                        start.toLocaleString() : end.toLocaleString()
                      )
                    }
                  </span>
                </>
              );
            })()}         
          {/* END STATUS TAG */}

          {session.duration && <div className="text-xs opacity-75">{session.duration}</div>}
        </div>
        {session.duration && <Play className="w-3 h-3 opacity-60 flex-shrink-0" />}
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <Accordion type="single" collapsible defaultValue={hasActiveSubSession ? session.id : undefined}>
        <AccordionItem value={session.id} className="border-none">
          <AccordionTrigger
            className={`px-3 py-2 hover:bg-gray-700 transition-colors rounded-lg [&[data-state=open]>div>svg]:rotate-90 ${
              hasActiveSubSession ? "bg-gray-700" : ""
            }`}
            style={{ paddingLeft: `${paddingLeft + 12}px` }}
          >
            <div className="flex items-center gap-3 w-full">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                  hasActiveSubSession ? "bg-blue-500 text-white" : "bg-gray-600 text-gray-200"
                }`}
              >
                <Layers className="w-3 h-3" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-sm truncate">{session.title}</div>
                <div className="text-xs opacity-75">
                  {session.sub_session?.length} sessions
                  {session.duration && ` • ${session.duration}`}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 transition-transform duration-200 flex-shrink-0" />
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-0 mt-1">
            <div className="space-y-1">
              {session.sub_session?.map((subSession, subIndex) => (
                <SessionItem
                  key={subSession.id}
                  session={subSession}
                  cohortID={cohortID}
                  cohort_variant={cohort_variant}
                  sessionID={sessionID}
                  index={subIndex}
                  depth={depth + 1}
                  timing={timing}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default function CohortContent() {
  const { cohortID, cohort_variant, sessionID } = useParams();
  const { currentUser } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [cohortContent, setCohortContent] = useState<any>(null);
  
  const [hasMarkedAttendance, setHasMarkedAttendance] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false); // OPTION A: prevent double-submit

  const [countdown, setCountdown] = useState("");

  const [timing, setTiming] = useState<Record<string, {session_start_time: Date, session_end_time: Date}>>({});
  
  // OPTION A: Scroll to top when session changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sessionID]);

  const fetchData = useCallback(async (userId: string | undefined) => {
    if (userId === undefined || !cohortID || !cohort_variant || !sessionID){
      setIsLoading(false);
      setError(null);
      return
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("cohort_enrollments")
        .select("*")
        .eq("user_id", userId)
        .contains("cohort_ids", [cohortID])
        .contains("cohort_variant_ids", [cohort_variant]);

      if (enrollmentError || !enrollmentData || enrollmentData.length === 0) {
        setIsEnrolled(false);
        setIsLoading(false);
        return;
      }

      setIsEnrolled(true);

      const { data: allContentData, error: contentError } = await supabase
        .from("cohort_content")
        .select("*")
        .eq("cohort_id", cohortID)
        .eq("cohort_variant_id", cohort_variant)

      const contentData = allContentData?.find((c) => c.session_id === sessionID);

      if (contentError || !allContentData || !contentData) {
        setCohortContent(null);
        setError("Session not found.");
        //console.error(contentError);
      } else {
        setTiming(
          allContentData.reduce((acc, c) => {
            acc[c.session_id] = {
              session_start_time: c.session_start_time ? new Date(c.session_start_time) : null,
              session_end_time: c.session_end_time ? new Date(c.session_end_time) : null,
            };
            return acc;
          }, {} as Record<string, { session_start_time: Date | null; session_end_time: Date | null }>)
        );
        setCohortContent(contentData);
        setHasMarkedAttendance(contentData.attendance_list?.includes(userId) || false);
      }
    } catch (e) {
      console.error("Supabase fetch error:", e);
      setError("Failed to fetch cohort data.");
    } finally {
      setIsLoading(false);
    }
  }, [cohortID, cohort_variant, sessionID]);

  useEffect(() => {
    if (!currentUser) return; // WAIT for user to load

    if (currentUser.id) {
      fetchData(currentUser.id);
    }
  }, [currentUser, cohortID, cohort_variant, sessionID, fetchData]);

  const cohort = cohorts.find((c) => c.id === cohortID);

  // OPTION A: memoize flattened sessions
  const safeCohortID = cohortID ?? "";
  const safeVariant = cohort_variant ?? "";
  const sessions = useMemo(
    () => (cohortSessions as CohortSessionsType)[safeCohortID]?.[safeVariant || ""] || [],
    [safeCohortID, safeVariant]
  );

  const flattenedSessions = useMemo(() => flattenSessions(sessions), [sessions]);

  flattenedSessions.map((s) =>  console.log(s.session_start_time));
  
  const currentSessionIndex = flattenedSessions.findIndex((m) => m.id === sessionID);
  const currentSession = flattenedSessions[currentSessionIndex];
  const nextSession =
    currentSessionIndex < flattenedSessions.length - 1
      ? flattenedSessions[currentSessionIndex + 1]
      : null;
  const prevSession =
    currentSessionIndex > 0 ? flattenedSessions[currentSessionIndex - 1] : null;

  // ------------------------------
  // SESSION STATE LOGIC
  // ------------------------------
  const now = new Date();
  const start = useMemo(() => (cohortContent?.session_start_time ? new Date(cohortContent.session_start_time) : null), [cohortContent?.session_start_time]);
  const end = useMemo(() => (cohortContent?.session_end_time ? new Date(cohortContent.session_end_time) : null), [cohortContent?.session_end_time]);

  let sessionStatus: "upcoming" | "live" | "ended" = "upcoming";
  if (start && now >= start && end && now <= end) sessionStatus = "live";
  else if (end && now > end) sessionStatus = "ended";

  let showZoom = false;
  if (sessionStatus === "live") showZoom = true;
  else if (sessionStatus === "upcoming" && start) {
    const diffMinutes = (start.getTime() - now.getTime()) / 1000 / 60;
    if (diffMinutes <= (cohortContent?.live_unlocked_minutes_before || 10)) showZoom = true;
  }

  const handleAttendance = async () => {
    if (!currentUser || !cohortContent || hasMarkedAttendance || attendanceSaving) return;

    setAttendanceSaving(true);

    const list = cohortContent.attendance_list || [];
    const newList = [...list, currentUser.id];

    const { error } = await supabase
      .from("cohort_content")
      .update({ attendance_list: newList })
      .eq("id", cohortContent.id);

    if (!error) {
      setCohortContent({ ...cohortContent, attendance_list: newList });
      setHasMarkedAttendance(true);
    }

    setAttendanceSaving(false);
  };

  // ------------------------------
  // LIVE FEATURES
  // ------------------------------

  useEffect(() => {
    if (!start) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = start.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown("Starting now");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [start]);


  const formatCal = (date: string) =>
    new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const googleCalUrl =
    start && end
      ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          currentSession?.title || "Cohort Session"
        )}&dates=${formatCal(start.toISOString())}/${formatCal(
          end.toISOString()
        )}&details=${encodeURIComponent("Cohort live session on Zoom")}`
      : "#";


  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      const urlObject = new URL(url);
      if (urlObject.hostname.includes("youtube.com") || urlObject.hostname.includes("youtu.be")) {
        const videoId = urlObject.searchParams.get("v") || urlObject.pathname.split("/").pop();
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0`;
      }
      return url;
    } catch (e) {
      console.error("Invalid video URL:", e);
      return null;
    }
  };

  // Only show replay if session has ended
  const videoUrl =
    sessionStatus === "ended" && cohortContent
      ? getVideoEmbedUrl(cohortContent.replay_link || cohortContent.video_file_url)
      : null;

  const getVariantDisplayName = (variant: string) => {
    const variantMap: Record<string, string> = {
      basic: "Basic",
      inter: "Intermediate",
      adv: "Advanced",
      theatre_basic: "Theatre Basic",
    };
    return variantMap[variant] || (variant ? variant.charAt(0).toUpperCase() + variant.slice(1) : "");
  };

  // ------------------------------
  // RENDER LOGIC + OPTION A FALLBACKS
  // ------------------------------
  if (isLoading)
    return (
      <section className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-3 h-6 w-40 bg-gray-700 rounded" />
          <p className="text-sm opacity-80">Loading cohort content...</p>
        </div>
      </section>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchData(currentUser?.id)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
          >
            Retry
          </button>
          <br />
          <Link to="/cohort-dashboard" className="text-blue-400 hover:text-blue-600">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );

  if (!cohort || !currentSession)
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Session Not Found</h2>
          <p className="text-gray-400 mb-2">
            Cohort: {cohortID}, Variant: {cohort_variant}, Session: {sessionID}
          </p>
          <p className="text-gray-500 mb-4 text-sm">Available sessions: {sessions.length} found</p>
          <Link to="/cohort-dashboard" className="text-blue-400 hover:text-blue-600">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );

  if (!isEnrolled)
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">You are not enrolled in this cohort.</h2>
          <p className="text-gray-400 mb-4">Please enroll to access this content.</p>
          <Link to="/cohort-dashboard" className="text-blue-400 hover:text-blue-600">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[#1b1b27] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/cohort-dashboard" className="flex items-center gap-2 px-3 py-2 bg-[#373751] hover:bg-[#373751cd] transition-colors rounded-md">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <div>
                <h1 className="text-xl font-bold">{cohort?.name || "Cohort"}</h1>
                <p className="text-sm">{getVariantDisplayName(cohort_variant || "")} Level</p>
              </div>
            </div>
            <div className="text-sm text-gray-200">Session {currentSessionIndex + 1} of {flattenedSessions.length}</div>
          </div>
        </div>
      </header>

      
      {start && end && (
        <div className="mt-4 max-w-7xl mx-auto px-4 flex items-center gap-4">

          {/* UPCOMING — show Starts */}
          {now < start && (
            <div className="text-sm text-white-300 bg-[#2d2d3a] border border-gray-700 px-4 py-2 rounded-lg inline-block">
              <span className="font-semibold text-gray-100">Starts:</span>{" "}
              {start.toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}{" "}
              •{" "}
              {start.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}

          {/* ENDED — show Ended */}
          {now > end && (
            <div className="text-sm text-gray-400 bg-[#2a2a33] border border-gray-700 px-4 py-2 rounded-lg inline-block">
              <span className="font-semibold text-gray-200">Ended:</span>{" "}
              {end.toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}{" "}
              •{" "}
              {end.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}

          {/* LIVE — show nothing */}
        </div>
      )}


      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* SESSION STATUS + ZOOM + ATTENDANCE */}
            <div className="bg-[#303045e1] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-lg text-sm ${
                    sessionStatus === "live"
                      ? "bg-red-600 text-white"
                      : sessionStatus === "upcoming"
                      ? "bg-blue-500 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {sessionStatus === "live" && "LIVE NOW"}
                  {sessionStatus === "upcoming" && "Upcoming Session"}
                  {sessionStatus === "ended" && "Session Ended"}
                </span>

                {showZoom && cohortContent?.zoom_meeting_url ? (
                  <a
                    href={cohortContent.zoom_meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Join Zoom
                  </a>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg cursor-not-allowed"
                  >
                    Zoom Locked
                  </button>
                )}

                {/* LIVE SESSION TOOLS (No Reminder) */}
                {sessionStatus === "upcoming" && (
                  <div className="mt-4 space-y-3">

                    {/* COUNTDOWN */}
                    <div className="inline-block bg-yellow-200 text-black text-sm px-3 py-1 rounded-lg font-medium">
                      Starts in: {countdown}
                    </div>

                    {/* ADD TO CALENDAR */}
                    <a
                      href={googleCalUrl}
                      target="_blank"
                      className="text-blue-300 hover:text-blue-400 text-sm font-medium flex items-center gap-1"
                    >
                      <Calendar size={16} />
                      Add to Calendar
                    </a>
                  </div>
                )}
              </div> 
              
              {sessionStatus === "live" && (
                <button
                  onClick={handleAttendance}
                  disabled={hasMarkedAttendance || attendanceSaving}
                  className={`mt-4 w-full px-4 py-2 rounded-lg transition ${
                    hasMarkedAttendance
                      ? "bg-gray-500 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {hasMarkedAttendance ? "Attendance Taken ✓" : attendanceSaving ? "Saving..." : "Mark Attendance"}
                </button>
              )}
            </div>

            {/* Video Player */}
            <div className="relative bg-black aspect-video rounded-xl overflow-hidden">
              
              {/* REPLAY COMING SOON */}
                {sessionStatus === "ended" && !videoUrl && (
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-lg mb-3 text-sm">
                    Replay coming soon…
                  </div>
                )}

              {videoUrl ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoUrl}
                  title={currentSession.title || "Embedded Video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 text-center px-4">
                  {sessionStatus === "ended"
                    ? "Replay not available for this session."
                    : sessionStatus === "live"
                    ? "Live session in progress. Join via Zoom."
                    : "Session has not started yet."}
                </div>
              )}
            </div>
            
            {/* Session Info */}
            <div className="bg-[#303045e1] rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-3">{currentSession.title}</h2>
              <p className="mb-6">{currentSession.description}</p>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6">
                {prevSession ? (
                  <Link
                    to={`/cohort-content/${cohortID}/${cohort_variant}/${prevSession.id}`}
                    className="flex items-center gap-2 px-4 py-2 hover:text-gray-200 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {prevSession.title}
                  </Link>
                ) : (
                  <div></div>
                )}

                {nextSession ? (
                  <Link
                    to={`/cohort-content/${cohortID}/${cohort_variant}/${nextSession.id}`}
                    className="flex items-center gap-2 px-4 py-2 hover:text-gray-200 transition-colors"
                  >
                    {nextSession.title}
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Link>
                ) : (
                  <div className="px-4 py-2 bg-green-200 text-green-700 rounded-lg font-medium">Cohort Complete!</div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full flex flex-col gap-6">
              {/* Documentation */}
              {cohortContent?.doc_file_url && (
                <AccordionItem value="documentation" className="bg-[#303045e1] border-none rounded-xl shadow-sm overflow-hidden">
                  <AccordionTrigger className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Documentation</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-[#1f1f2a]">
                    <a
                      href={cohortContent.doc_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-600 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Download Session Docs
                    </a>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Additional Resources */}
              {cohortContent?.resources && cohortContent.resources.length > 0 && (
                <AccordionItem value="resources" className="bg-[#303045e1] border-none rounded-xl shadow-sm overflow-hidden">
                  <AccordionTrigger className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4" />
                      <span className="font-medium">Resources</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-[#1f1f2a] flex flex-col gap-2">
                    {cohortContent.resources.map((res: { title: string; url: string }, idx: number) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {res.title}
                      </a>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}


              {/* Enhanced SCHEDULE PANEL */}
              <AccordionItem    
                value="schedule"
                className="bg-[#2b2b3b] border border-gray-700/40 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm"
              >
                <AccordionTrigger className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-700/40 transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-indigo-300" />
                    <span className="font-medium tracking-wide">Upcoming Schedule</span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-5 bg-[#1a1a24] space-y-4">
                  {flattenedSessions
                    .filter(
                      (s) =>
                        timing[s.id]?.session_start_time &&
                        new Date(timing[s.id].session_start_time) > new Date()
                    )
                    .sort(
                      (a, b) =>
                        timing[a.id].session_start_time.getTime() -
                        timing[b.id].session_start_time.getTime()
                    )
                    .map((s) => (
                      <Link
                        key={s.id}
                        to={`/cohort-content/${cohortID}/${cohort_variant}/${s.id}`}
                        className="block group"
                      >
                        <div className="p-4 rounded-xl border border-gray-700/50 bg-[#23232f] group-hover:bg-[#2d2d3a] transition-all duration-300 flex items-center justify-between shadow-md backdrop-blur-sm">
                          <div className="space-y-1">
                            <p className="font-medium group-hover:text-indigo-300 transition-colors">
                              {s.title}
                            </p>
                            <span className="text-sm text-white-400">
                              {timing[s.id] &&
                                new Date(timing[s.id].session_start_time).toLocaleString()}
                            </span>
                          </div>

                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-300 transition-colors" />
                        </div>
                      </Link>
                    ))}
                </AccordionContent>
              </AccordionItem>


              {/* Session List */}
              <AccordionItem value="sessions" className="bg-[#303045e1] border-none rounded-xl shadow-sm overflow-hidden">
                <AccordionTrigger className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4" />
                    <span className="font-medium">All Sessions</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-[#1f1f2a] flex flex-col gap-2 max-h-[500px] overflow-y-auto">
                  {sessions.map((session, idx) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      cohortID={cohortID!}
                      cohort_variant={cohort_variant!}
                      sessionID={sessionID!}
                      index={idx}
                      timing={timing}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}