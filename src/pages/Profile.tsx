import type { UserProfileType } from "@/constants/types";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";
import { useParams } from "react-router-dom";
import profileBg from "/assets/profileBG.png";

export default function Profile() {
  const { userID } = useParams();
  console.log("params userID:", userID);

  const { currentUser, supabaseAuthUser } = useUser();

  const [user, setUser] = useState<Partial<UserProfileType> | null>(
    currentUser
  );
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);

  /*
  useEffect(() => {
    async function getUserProfile() {
      if (!userID) {
        setError("User ID is missing from the URL.");
        setIsLoading(false);
        return;
      } else {
        console.log(userID);
      }

      setError(null);
      setIsLoading(true);

      try {
        const fetchedProfile = await fetchUserProfile(userID);
        if (fetchedProfile) {
          setUser(fetchedProfile);
        } else {
          setError("User profile not found or could not be fetched.");
          setUser(null);
        }
      } catch (err: any) {
        console.error("Failed to fetch user profile:", err);
        setError(
          `Failed to load profile: ${
            err.message || "An unknown error occurred."
          }`
        );
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    getUserProfile();
  }, [fetchUserProfile, userID]);

  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center bg-red-800 text-white p-4">
        <p className="text-xl font-bold">Error: {error}</p>
        <p>Please try again later or ensure the user ID is valid.</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center bg-[#1b1b27] text-white">
        <p className="text-xl">No profile data available.</p>
      </section>
    );
  }
  */

  return (
    <section
      className="w-full min-h-screen flex items-center justify-around"
      style={{
        backgroundImage: `url(${profileBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section className="px-12 py-8 lg:px-28 lg:py-16 flex flex-col items-center justify-center gap-2 lg:gap-6 rounded-2xl bg-[#1b1b27]">
        <Avatar className="w-22 h-22 md:w-28 md:h-28 lg:w-32 lg:h-32 shadow-lg flex items-center justify-center">
          <AvatarImage
            src={user?.avatar}
            alt={`Avatar of ${user?.username}`}
            className="rounded-full object-cover"
          />
          <AvatarFallback className="text-4xl md:text-5xl lg:text-6xl font-bold capitalize bg-gray-300 p-4 rounded-full">
            {user?.username?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-lg md:text-2xl lg:text-4xl font-bold">
          {user?.username}
        </h2>
        <p className="px-4 md:px-6 py-1 text-sm rounded-full bg-[#3bb4fd]">{`Member since ${new Date(
          supabaseAuthUser?.created_at
        ).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`}</p>
      </section>
    </section>
  );
}
