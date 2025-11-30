import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { courseModules, courses } from "@/constants/data";
import { useUser } from "@/contexts/UserContext";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  FileText,
  Play,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/supabase_client";
import { marked } from "marked";

type NoteType = {
  type: "heading" | "paragraph" | "list";
  level?: number;
  text?: string;
  items?: string[];
};

const parseMarkdownToNotes = (markdown: string): NoteType[] => {
  const notes: NoteType[] = [];
  const lexer = marked.lexer(markdown);

  lexer.forEach((token: any) => {
    if (token.type === "heading") {
      notes.push({
        type: "heading",
        level: token.depth,
        text: token.text,
      });
    } else if (token.type === "paragraph") {
      notes.push({
        type: "paragraph",
        text: token.text,
      });
    } else if (token.type === "list") {
        notes.push({
          type: "list",
          items: token.items.map((i: any) => i.text),
        });
      }
  });

  return notes;
};

// Updated ModuleType to support nested structure
type ModuleType = {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  sub_module?: ModuleType[];
};

// Updated courseModules type to match your structure
type CourseModulesType = Record<string, Record<string, ModuleType[]>>;

// Helper function to flatten modules for navigation
const flattenModules = (modules: ModuleType[]): ModuleType[] => {
  const flattened: ModuleType[] = [];

  const traverse = (moduleList: ModuleType[]) => {
    moduleList.forEach((module) => {
      if (module.sub_module && module.sub_module.length > 0) {
        // This is a parent module with sub-modules, traverse the sub-modules
        traverse(module.sub_module);
      } else {
        // This is a leaf module (actual lesson), add it to flattened array
        flattened.push(module);
      }
    });
  };

  traverse(modules);
  return flattened;
};

// Recursive component for rendering modules and sub-modules in the sidebar
const ModuleItem = ({
  module,
  courseID,
  course_variant,
  moduleID,
  index,
  depth = 0,
}: {
  module: ModuleType;
  courseID: string;
  course_variant: string;
  moduleID: string;
  index: number;
  depth?: number;
}) => {
  const hasSubModules = module.sub_module && module.sub_module.length > 0;
  const paddingLeft = depth * 16;
  const isActive = module.id === moduleID;

  // Check if any sub-module is active (for auto-expansion)
  const hasActiveSubModule = module.sub_module?.some((subMod) => {
    const checkActive = (mod: ModuleType): boolean => {
      if (mod.id === moduleID) return true;
      if (mod.sub_module) {
        return mod.sub_module.some(checkActive);
      }
      return false;
    };
    return checkActive(subMod);
  });

  if (!hasSubModules) {
    // Leaf module - render as a clickable link
    return (
      <Link
        to={`/course-content/${courseID}/${course_variant}/${module.id}`}
        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          isActive
            ? "bg-blue-800 text-white"
            : "hover:bg-gray-700 text-gray-200"
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
          <div className="font-medium text-sm truncate">{module.title}</div>
          {module.duration && (
            <div className="text-xs opacity-75">{module.duration}</div>
          )}
        </div>
        {module.duration && (
          <Play className="w-3 h-3 opacity-60 flex-shrink-0" />
        )}
      </Link>
    );
  }

  // Parent module with sub-modules - render as nested accordion
  return (
    <div className="space-y-1">
      <Accordion
        type="single"
        collapsible
        defaultValue={hasActiveSubModule ? module.id : undefined}
      >
        <AccordionItem value={module.id} className="border-none">
          <AccordionTrigger
            className={`px-3 py-2 hover:bg-gray-700 transition-colors rounded-lg [&[data-state=open]>div>svg]:rotate-90 ${
              hasActiveSubModule ? "bg-gray-700" : ""
            }`}
            style={{ paddingLeft: `${paddingLeft + 12}px` }}
          >
            <div className="flex items-center gap-3 w-full">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                  hasActiveSubModule
                    ? "bg-blue-500 text-white"
                    : "bg-gray-600 text-gray-200"
                }`}
              >
                <Layers className="w-3 h-3" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-sm truncate">
                  {module.title}
                </div>
                <div className="text-xs opacity-75">
                  {module.sub_module?.length} lessons
                  {module.duration && ` • ${module.duration}`}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 transition-transform duration-200 flex-shrink-0" />
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0 mt-1">
            <div className="space-y-1">
              {module.sub_module?.map((subModule, subIndex) => (
                <ModuleItem
                  key={subModule.id}
                  module={subModule}
                  courseID={courseID}
                  course_variant={course_variant}
                  moduleID={moduleID}
                  index={subIndex}
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

// Helper to render heading/paragraph/list notes
const NotesRenderer = ({ notes }: { notes: any[] }) => {
  return (
    <div className="space-y-8"> {/* overall spacing between notes */}
      {notes.map((note, index) => {
        switch (note.type) {
            case "heading":
              if (note.level === 1) {
                return (
                  <h2 key={index} className="text-3xl font-bold text-white mb-6">
                    {note.text}
                  </h2>
                );
              } else if (note.level === 2) {
                return (
                  <h3 key={index} className="text-2xl font-semibold text-white mb-4">
                    {note.text}
                  </h3>
                );
              } else if (note.level === 3) {
                return (
                  <h4 key={index} className="text-xl font-semibold text-white mb-3">
                    {note.text}
                  </h4>
                );
              }
              return null;
            case "paragraph":
              return (
                <p
                  key={index}
                  className="text-gray-300 text-lg leading-relaxed mb-6"
                  dangerouslySetInnerHTML={{ __html: marked.parseInline(note.text || "") }}
                />
              );
            case "list":
              return (
                <ul key={index} className="list-disc list-inside text-gray-300 text-lg space-y-2 mb-6">
                  {note.items?.map((item, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: marked.parseInline(item) }} />
                  ))}
                </ul>
              );
            default:
              return null;
          }
      })}
    </div>
  );
};

export default function CourseContent() {
  const { courseID, course_variant, moduleID } = useParams();
  const { currentUser } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseContent, setCourseContent] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const fetchData = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check Enrollment
      /*const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", userId)
        .contains("course_ids", [courseID])
        .contains("variant_ids", [course_variant]);

      if (enrollmentError || !enrollmentData || enrollmentData.length === 0) {
        setIsEnrolled(false);
        setIsLoading(false);
        return;
      }

      setIsEnrolled(true); */

      // Check Subscription Status
      const { data: subData, error: subError } = await supabase
        .from("user_subscriptions")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();

      if (subError) {
        console.error("Subscription fetch error:", subError);
        setIsSubscribed(false);
      } else {
        setIsSubscribed(subData?.status === "active" || subData?.status === "trialing"|| subData?.status === "past_due" || subData?.status === "unpaid");
      }

      // 2. Fetch Course Content
      const { data: contentData, error: contentError } = await supabase
        .from("course_content")
        .select("*")
        .eq("course_id", courseID)
        .eq("course_variant_id", course_variant)
        .eq("module_id", moduleID)
        .maybeSingle();

      if (contentError || !contentData) {
        setCourseContent(null);
        setError("Module content not found.");
        //console.error(contentError);
      } else {
        const notes = contentData.markdown_content
          ? parseMarkdownToNotes(contentData.markdown_content)
          : [];

        setCourseContent({
        ...contentData,
        notes,
      });
      }
    } catch (e) {
    //  console.error("Supabase fetch error:", e);
      setError("Failed to fetch course data.");
    } finally {
      setIsLoading(false);
    }
  }, [courseID, course_variant, moduleID]);

  useEffect(() => {
    if (!currentUser) return; // WAIT for user to load

    if (currentUser.id) {
      fetchData(currentUser.id);
    }
  }, [currentUser, courseID, course_variant, moduleID, fetchData]);


  // Find the course and modules using the updated structure
  const course = courses.find((c) => c.id === courseID);

  // Access modules using the nested structure: courseModules[courseID][course_variant]
  const safeCourseID = courseID ?? "";
  const safeVariant = course_variant ?? "";
  const modules =
    (courseModules as CourseModulesType)[safeCourseID]?.[safeVariant || ""] ||
    [];

  // Flatten modules for navigation (only leaf modules that are actual lessons)
  const flattenedModules = flattenModules(modules);
  const currentModuleIndex = flattenedModules.findIndex(
    (m) => m.id === moduleID
  );
  const currentModule = flattenedModules[currentModuleIndex];

  const nextModule =
    currentModuleIndex < flattenedModules.length - 1
      ? flattenedModules[currentModuleIndex + 1]
      : null;
  const prevModule =
    currentModuleIndex > 0 ? flattenedModules[currentModuleIndex - 1] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-3 h-6 w-40 bg-gray-700 rounded" />
          <p className="text-sm opacity-80">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link
            to="/learning-dashboard"
            className="text-blue-400 hover:text-blue-600"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            You are not subscribed.
          </h2>
          <p className="text-gray-400 mb-4">
            Please subscribe to access this content.
          </p>
          <Link
            to="/pricing-page"
            className="text-blue-400 hover:text-blue-600"
          >
            Subscribe Now
          </Link>
        </div>
      </div>
    );
  }

  if (!course || !currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Module Not Found</h2>
          <p className="text-gray-400 mb-2">
            Course: {courseID}, Variant: {course_variant}, Module: {moduleID}
          </p>
          <p className="text-gray-500 mb-4 text-sm">
            Available modules: {modules.length} found
          </p>
          <Link
            to="/learning-dashboard"
            className="text-blue-400 hover:text-blue-600"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // A helper function to dynamically render the video URL for the iframe
  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      const urlObject = new URL(url);
      if (
        urlObject.hostname.includes("youtube.com") ||
        urlObject.hostname.includes("youtu.be")
      ) {
        const videoId =
          urlObject.searchParams.get("v") ||
          urlObject.pathname.split("/").pop();
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0`;
      }
      return url;
    } catch (e) {
      console.error("Invalid video URL:", url, e);
      return null;
    }
  };

  const videoUrl = courseContent
    ? getVideoEmbedUrl(courseContent.video_file_url)
    : null;

  // Helper function to get variant display name
  const getVariantDisplayName = (variant: string) => {
    const variantMap: Record<string, string> = {
      basic: "Basic",
      inter: "Intermediate",
      adv: "Advanced",
      theatre_basic: "Theatre Basic",
    };
    return (
      variantMap[variant] || variant.charAt(0).toUpperCase() + variant.slice(1)
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[#1b1b27] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/learning-dashboard"
                className="flex items-center gap-2 px-3 py-2 bg-[#373751] hover:bg-[#373751cd] transition-colors rounded-md"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <div>
                <h1 className="text-xl font-bold">{course.name}</h1>
                <p className="text-sm">
                  {getVariantDisplayName(course_variant || "")} Level
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-200">
              Lesson {currentModuleIndex + 1} of {flattenedModules.length}
            </div>
          </div>
        </div>
      </header>

      <hr className="opacity-20" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#303045e1] rounded-2xl shadow-lg p-8 space-y-8">
              {/* Module Title */}
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-white leading-snug">
                  {currentModule.title}
                </h1>
              </div>
            </div>
            {/* Video Player */}
            {videoUrl && (
            <div className="relative bg-black aspect-video rounded-xl overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoUrl}
                  title={currentModule.title || "Embedded Video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
            </div>
            )}

            {/* Module Info */}
            <div className="bg-[#303045e1] rounded-2xl shadow-lg p-8 space-y-8">
                {/* Module Title */}
                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold text-white leading-snug">
                    {currentModule.title}
                  </h1>
                  {currentModule.description && (
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {currentModule.description}
                    </p>
                  )}
                </div>

                {/* Notes Section */}
                {courseContent?.notes && courseContent?.notes.length > 0 && (
                  <div className="bg-[#252534] rounded-xl p-6 shadow-inner space-y-6">
                    <h2 className="text-2xl font-semibold text-white border-b border-gray-600 pb-2 mb-4">
                      Lesson Notes
                    </h2>
                    <NotesRenderer notes={courseContent.notes} />
                  </div>
                )}

                {/* Module Navigation */}
                <div className="flex justify-between items-center mt-6">
                  {/* Previous Module */}
                  {prevModule ? (
                    <Link
                      to={`/course-content/${courseID}/${course_variant}/${prevModule.id}`}
                      className="flex items-center gap-2 px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all shadow-sm text-white font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="truncate max-w-xs">{prevModule.title}</span>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {/* Next Module */}
                  {nextModule ? (
                    <Link
                      to={`/course-content/${courseID}/${course_variant}/${nextModule.id}`}
                      className="flex items-center gap-2 px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all shadow-sm text-white font-medium"
                    >
                      <span className="truncate max-w-xs">{nextModule.title}</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                  ) : (
                    <div className="px-5 py-3 bg-green-500 text-white rounded-lg font-medium shadow-sm">
                      Course Complete!
                    </div>
                  )}
                </div>
              </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            <Accordion
              type="single"
              collapsible
              className="w-full flex flex-col gap-6"
            >
              {/* 1. Documentation Accordion */}
              {courseContent?.doc_file_url && (
                <AccordionItem
                  value="documentation"
                  className="bg-[#303045e1] border-none rounded-xl shadow-sm overflow-hidden"
                >
                  <AccordionTrigger className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-200" />
                      <span className="font-medium text-gray-200">
                        Documentation / Transcript
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 border-t border-gray-500">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-200 leading-relaxed mb-4">
                        A detailed documentation for this module is available.
                      </p>
                      <a
                        href={courseContent.doc_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Documentation
                      </a>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* 2. Source Links Accordion */}
              {(courseContent?.worksheet_file_url ||
                courseContent?.resource_file_url) && (
                <AccordionItem
                  value="source-links"
                  className="bg-[#303045e1] border-none rounded-xl shadow-sm overflow-hidden"
                >
                  <AccordionTrigger className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-gray-200" />
                      <span className="font-medium text-gray-200">
                        Source Links & Resources
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-0 border-t border-gray-500">
                    <div className="space-y-3 pt-4">
                      {courseContent?.worksheet_file_url && (
                        <a
                          href={courseContent.worksheet_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Worksheet
                        </a>
                      )}
                      {courseContent?.resource_file_url && (
                        <a
                          href={courseContent.resource_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Additional Reading
                        </a>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* 3. Module List Accordion - Updated with nested structure */}
              <AccordionItem
                value="module-list"
                className="bg-[#303045e1] rounded-xl shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gray-200" />
                    <span className="font-medium text-gray-200">
                      Course Modules
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0 border-t border-gray-500">
                  <div className="space-y-2 pt-4">
                    {modules.map((module, index) => (
                      <ModuleItem
                        key={module.id}
                        module={module}
                        courseID={courseID || ""}
                        course_variant={course_variant || ""}
                        moduleID={moduleID || ""}
                        index={index}
                        depth={0}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
