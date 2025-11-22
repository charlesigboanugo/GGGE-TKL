import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/supabase_client";
import { type User as SupabaseAuthUser } from "@supabase/supabase-js";
import type {
  UserContextType,
  UserProfileType,
  UserProviderPropsType,
} from "@/constants/types";

// Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider
export const UserProvider: React.FC<UserProviderPropsType> = ({ children }) => {
  const [supabaseAuthUser, setSupabaseAuthUser] =
    useState<SupabaseAuthUser | null>(null);
  const [currentUser, setCurrentUser] =
    useState<Partial<UserProfileType> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  // Ref to track if we're currently fetching profile to prevent race conditions
  const isFetchingProfile = useRef<boolean>(false);

  // Fetch Profile - Stable function with useCallback
  const fetchUserProfile = useCallback(async (userId: string) => {
    console.log("[UserContext] Fetching profile for user:", userId);

    // Prevent concurrent fetches
    if (isFetchingProfile.current) {
      console.log("[UserContext] Profile fetch already in progress, skipping");
      return null;
    }

    isFetchingProfile.current = true;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        console.error("[UserContext] Error fetching profile:", error);
        return null;
      }

      console.log("[UserContext] Profile fetched successfully:", data);
      setCurrentUser(data);
      return data;
    } catch (err) {
      console.error("[UserContext] Unexpected error fetching profile:", err);
      return null;
    } finally {
      isFetchingProfile.current = false;
    }
  }, []);

  // Ensure Profile Exists - Stable function
  const ensureProfileExists = useCallback(async (user: SupabaseAuthUser) => {
    console.log(
      "[UserContext] Checking if profile exists for user:",
      user.email
    );

    try {
      const { data: existing, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[UserContext] Error checking profile existence:", error);
        return false;
      }

      if (!existing) {
        console.log(
          "[UserContext] Profile doesn't exist, creating fallback profile"
        );
        const username = user.email?.split("@")[0] ?? "learner";
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          username,
          email: user.email,
          role: "student",
          is_member: false,
        });

        if (insertError) {
          console.error(
            "[UserContext] Error creating fallback profile:",
            insertError
          );
          return false;
        }
        console.log("[UserContext] Fallback profile created for", username);
      } else {
        console.log("[UserContext] Profile already exists");
      }

      return true;
    } catch (err) {
      console.error(
        "[UserContext] Unexpected error in ensureProfileExists:",
        err
      );
      return false;
    }
  }, []);

  // Update Profile - Stable function
  const updateUserProfile = useCallback(
    async (data: Partial<UserProfileType>) => {
      if (!supabaseAuthUser?.id) {
        console.log("[UserContext] No authenticated user for profile update");
        return false;
      }

      console.log("[UserContext] Updating profile with data:", data);

      try {
        // Use upsert to gracefully handle both new and existing profiles.
        // The `onConflict` clause tells Supabase which column to use to
        // determine if a row already exists.
        const { error } = await supabase.from("profiles").upsert(
          {
            ...data,
            id: supabaseAuthUser.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

        if (error) {
          console.error("[UserContext] Error updating profile:", error);
          return false;
        }

        console.log(
          "[UserContext] Profile updated successfully, refetching..."
        );
        await fetchUserProfile(supabaseAuthUser.id);
        return true;
      } catch (err) {
        console.error("[UserContext] Unexpected error updating profile:", err);
        return false;
      }
    },
    [supabaseAuthUser?.id, fetchUserProfile, supabase]
  );

  // Upload Avatar - Stable function
  const uploadUserAvatar = useCallback(
    async (file: File) => {
      if (!supabaseAuthUser?.id) {
        console.log("[UserContext] No authenticated user for avatar upload");
        return null;
      }

      console.log(
        "[UserContext] Uploading avatar for user:",
        supabaseAuthUser.email
      );

      try {
        const fileExtension = file.name.split(".").pop();
        const filePath = `${supabaseAuthUser.id}-${uuidv4()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error("[UserContext] Avatar upload failed:", uploadError);
          return null;
        }

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        const publicUrl = data?.publicUrl;

        if (!publicUrl) {
          console.error("[UserContext] Failed to get avatar public URL");
          return null;
        }

        const success = await updateUserProfile({ avatar: publicUrl });
        return success ? publicUrl : null;
      } catch (err) {
        console.error("[UserContext] Unexpected error uploading avatar:", err);
        return null;
      }
    },
    [supabaseAuthUser?.id, updateUserProfile]
  );

  // Delete Profile - Improved with better error handling and debugging
  const deleteUserProfile = useCallback(async () => {
    // Ensure a user is authenticated before attempting deletion
    if (!supabaseAuthUser?.id) {
      console.log(
        "[UserContext] No authenticated user for account deletion request."
      );
      return false;
    }

    // Confirm with the user before proceeding
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      console.log("[UserContext] Account deletion cancelled by user.");
      return false;
    }

    console.log(
      "[UserContext] Initiating account deletion for user:",
      supabaseAuthUser.email
    );

    try {
      // Get the current session to ensure we have a valid token
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !session?.session) {
        console.error("[UserContext] No valid session found:", sessionError);
        alert("Authentication session expired. Please log in again.");
        return false;
      }

      console.log("[UserContext] Session validated, calling edge function...");

      // Call the 'delete-user-handler' Edge Function
      const { data, error } = await supabase.functions.invoke(
        "delete-user-handler", // Make sure this matches your deployed function name exactly
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`, // Explicitly pass the token
          },
          // You can add an empty body if needed
          body: JSON.stringify({}),
        }
      );

      // Enhanced error logging
      if (error) {
        console.error(
          "[UserContext] Error calling delete-user-handler Edge Function:",
          {
            error,
            message: error.message,
            context: error.context,
            details: error.details,
            status: error.status,
          }
        );

        // More user-friendly error messages
        let userMessage = "Failed to delete account.";
        if (error.message?.includes("Failed to send a request")) {
          userMessage =
            "Network error: Unable to reach the server. Please check your connection and try again.";
        } else if (error.message?.includes("authorization")) {
          userMessage =
            "Authentication error: Please log out and log back in, then try again.";
        } else if (error.message) {
          userMessage = `Error: ${error.message}`;
        }

        alert(userMessage);
        return false;
      }

      console.log("[UserContext] Edge function response:", data);

      // Check if the response indicates success
      if (data?.message || data?.userId) {
        console.log(
          "[UserContext] Account deletion request sent successfully:",
          data
        );
        alert(
          "Your account has been successfully deleted. You will be logged out."
        );

        // On successful deletion, log out the user on the client side
        await supabase.auth.signOut();

        // Clear local state
        if (typeof setSupabaseAuthUser === "function")
          setSupabaseAuthUser(null);
        if (typeof setCurrentUser === "function") setCurrentUser(null);
        if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);

        // Redirect to a safe page
        window.location.href = "/";
        return true;
      } else {
        console.error("[UserContext] Unexpected response format:", data);
        alert("Unexpected response from server. Please try again.");
        return false;
      }
    } catch (err) {
      console.error(
        "[UserContext] Unexpected error during account deletion process:",
        {
          error: err,
          message: err.message,
          stack: err.stack,
        }
      );

      let userMessage = "An unexpected error occurred during account deletion.";
      if (err.message?.includes("network") || err.message?.includes("fetch")) {
        userMessage =
          "Network error: Please check your connection and try again.";
      }

      alert(userMessage);
      return false;
    }
  }, [supabaseAuthUser?.id, supabaseAuthUser?.email]);

  // Sign Out - Stable function
  const signOut = useCallback(async () => {
    console.log("[UserContext] Signing out user");
    setLoadingUser(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[UserContext] Sign out error:", error);
      } else {
        console.log("[UserContext] Signed out successfully");
        setSupabaseAuthUser(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("[UserContext] Unexpected error during sign out:", err);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // Effect 1: Initialize Auth Session and Set Up Listener
  useEffect(() => {
    console.log("[UserContext] Setting up auth session and listener");
    setLoadingUser(true);

    async function initializeAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("[UserContext] Session fetch error:", error);
          setLoadingUser(false);
          return;
        }

        const user = session?.user;
        if (user) {
          console.log("[UserContext] Authenticated user found:", user.email);
          setSupabaseAuthUser(user);
          setIsAuthenticated(true);
        } else {
          console.log("[UserContext] No user session found");
          setSupabaseAuthUser(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
          setLoadingUser(false);
        }
      } catch (err) {
        console.error("[UserContext] Unexpected error initializing auth:", err);
        setLoadingUser(false);
      }
    }

    initializeAuth();

    // Set up auth state change listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[UserContext] Auth event: ${event}`);
        const user = session?.user;

        if (user) {
          console.log(
            "[UserContext] Auth state changed - user signed in:",
            user.email
          );
          setSupabaseAuthUser(user);
          setIsAuthenticated(true);
        } else {
          console.log("[UserContext] Auth state changed - user signed out");
          setSupabaseAuthUser(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
        setLoadingUser(false);
      }
    );

    return () => {
      console.log("[UserContext] Cleaning up auth listener");
      listener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array - this should only run once

  // Effect 2: Handle Profile Fetching When Auth User Changes
  useEffect(() => {
    async function handleProfileSync() {
      // Only proceed if we have an authenticated user but no profile
      if (!supabaseAuthUser || currentUser) {
        return;
      }

      console.log(
        "[UserContext] Auth user exists but no profile, fetching profile..."
      );

      try {
        const profile = await fetchUserProfile(supabaseAuthUser.id);

        if (!profile) {
          console.log(
            "[UserContext] No profile found, ensuring profile exists..."
          );
          const created = await ensureProfileExists(supabaseAuthUser);

          if (created) {
            console.log(
              "[UserContext] Profile created/verified, fetching again..."
            );
            await fetchUserProfile(supabaseAuthUser.id);
          } else {
            console.error("[UserContext] Failed to create/verify profile");
          }
        }
      } catch (err) {
        console.error("[UserContext] Error in profile sync:", err);
      } finally {
        setLoadingUser(false);
      }
    }

    handleProfileSync();
  }, [supabaseAuthUser, currentUser, fetchUserProfile, ensureProfileExists]);

  // Effect 3: Debug logging for state changes
  useEffect(() => {
    console.log("[UserContext] State changed:", {
      hasAuthUser: !!supabaseAuthUser,
      hasProfile: !!currentUser,
      isAuthenticated,
      loadingUser,
      userEmail: supabaseAuthUser?.email,
      profileId: currentUser?.id,
    });
  }, [supabaseAuthUser, currentUser, isAuthenticated, loadingUser]);

  // Context Value
  const contextValue: UserContextType = {
    supabaseAuthUser,
    currentUser,
    isAuthenticated,
    loadingUser,
    signOut,
    fetchUserProfile,
    ensureProfileExists,
    updateUserProfile,
    uploadUserAvatar,
    deleteUserProfile,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

// Hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
