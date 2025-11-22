import { useState, useEffect } from "react";
import { LoadingPage } from "@/pages";
import { supabase } from "@/supabase_client";

// Assuming "@/supabase_client" exports a pre-initialized Supabase client
// If not, uncomment and use the createClient setup below.
// import { supabase } from "@/supabase_client";

// Define types (ensure these match your database schema)
interface CourseVariantType {
  id: string;
  course_id: string;
  name: string;
  description: string;
  duration: string;
  features: string[];
  price_phase1_1st: number; // Example price column, include all if needed for types
  // ... other price columns for phase1 and phase2
}

interface CourseType {
  id: string;
  name: string;
  description: string;
  color: string;
  status: string; // 'active' | 'inactive'
  variants: CourseVariantType[]; // This will be populated from DB
}

export default function CourseList() {
  const [coursesData, setCoursesData] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null); // To show loading on specific button

  // Function to toggle course status
  async function handleCourseStatusChange(
    courseId: string,
    currentStatus: string
  ) {
    setUpdatingCourseId(courseId); // Set loading state for this specific course
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      const { error: updateError } = await supabase
        .from("courses")
        .update({ status: newStatus })
        .eq("id", courseId);

      if (updateError) {
        throw updateError;
      }

      // Update the local state to reflect the change immediately
      setCoursesData((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId ? { ...course, status: newStatus } : course
        )
      );

      console.log(`Course ${courseId} status changed to ${newStatus}`);
    } catch (err: any) {
      console.error(`Error changing status for course ${courseId}:`, err);
      setError(`Failed to update status for ${courseId}.`);
    } finally {
      setUpdatingCourseId(null); // Clear loading state
    }
  }

  useEffect(() => {
    async function fetchCoursesAndVariants() {
      setLoading(true);
      setError(null);
      try {
        // Fetch courses from the 'courses' table
        const { data: courses, error: coursesError } = await supabase
          .from("courses")
          .select("*"); // Select all columns

        if (coursesError) {
          throw coursesError;
        }

        // Fetch course variants from the 'course_variants' table
        const { data: variants, error: variantsError } = await supabase
          .from("course_variants")
          .select("*"); // Select all columns

        if (variantsError) {
          throw variantsError;
        }

        // Map variants to their respective courses
        const mappedCourses: CourseType[] = courses.map((course) => ({
          ...course,
          variants: variants.filter(
            (variant) => variant.course_id === course.id
          ),
        }));

        setCoursesData(mappedCourses);
      } catch (err: any) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchCoursesAndVariants();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) return <LoadingPage />;

  if (error) {
    return (
      <section className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-red-500">
        <p>Error: {error}</p>
      </section>
    );
  }

  if (coursesData.length === 0) {
    return (
      <section className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
        <p>No courses found. Please add courses to the database.</p>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {coursesData.map((course) => (
          <div
            key={course.id}
            className="flex flex-col bg-[#222230] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          >
            <div className="p-5 flex-grow">
              <h2 className="text-xl font-semibold mb-2">{course.name}</h2>
              <ul className="flex flex-wrap gap-x-2 text-sm text-gray-200 mb-4">
                {course.variants.map((variant) => (
                  <li
                    key={variant.id}
                    className="after:content-['•'] last:after:content-[''] after:ml-2"
                  >
                    {variant.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 border-t border-gray-700">
              <button
                onClick={() =>
                  handleCourseStatusChange(course.id, course.status)
                } // Pass course.id and current status
                disabled={updatingCourseId === course.id} // Disable button while updating
                className={`w-full py-2 px-4 rounded-md text-white font-semibold capitalize transition-colors duration-200
                  ${
                    course.status === "active"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-500 hover:bg-gray-600"
                  }
                  ${
                    updatingCourseId === course.id
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                {updatingCourseId === course.id ? "Updating..." : course.status}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
