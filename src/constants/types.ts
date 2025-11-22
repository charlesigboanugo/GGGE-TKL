import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { ReactNode } from "react";

type ProfileType = {
  avatar: string;
  username: string;
  country: string;
  bio: string;
};

type ProfileInputFieldType = {
  type: string;
  placeholder: string;
  label: string;
  required: boolean;
};

type PhaseType = "before_launch" | "phase_1" | "phase_2" | "closed";

type CourseVariantType = {
  id: string;
  name: string;
  description: string;
  duration: string;
  features: string[];
  popular?: boolean;
};

type CohortVariantType = {
  id: string;
  name: string;
  description: string;
  duration: string;
  features: string[];
  popular?: boolean;
};

type CourseType = {
  id: string;
  name: string;
  description: string;
  variants: CourseVariantType[];
  color: string;
  status: "active" | "inactive";
};
type CohortType = {
  id: string;
  name: string;
  description: string;
  variants: CourseVariantType[];
  color: string;
  status: "active" | "inactive";
};
type CartItemType = {
  courseId: string;
  variantId: string;
  courseName: string;
  variantName: string;
};

type LaunchTimerPropsType = {
  launchDate: Date;
  onPhaseChange?: (phase: PhaseType) => void;
};

type PricingCardPropsType = {
  variant: CourseVariantType;
  courseColor: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

type CartPropsType = {
  cartItems: CartItemType[];
  onRemoveItem: (courseId: string, variantId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  launchPhase: PhaseType;
};

type ModuleType = {
  id: string;
  title: string;
  description: string;
  duration?: string;
  sub_module?: ModuleType[];
};

type SessionType = {
  id: string;
  title: string;
  description: string;
  duration?: string;
  sub_session?: SessionType[];
};

type RoleType = "admin" | "student";

// Define the shape of your custom profile data
type UserProfileType = {
  id: string; // This will be the auth.users.id
  username: string | null;
  email: string | null;
  avatar: string | null;
  country: string | null;
  bio: string | null;
  role: RoleType;
  is_member: boolean;
  // Add any other fields from your profiles table here
  // And potentially from auth.users if you need them directly on the currentUser object
};

// Define the shape of your context value
type UserContextType = {
  supabaseAuthUser: SupabaseAuthUser | null;
  currentUser: Partial<UserProfileType> | null;
  isAuthenticated: boolean;
  loadingUser: boolean;
  signOut: () => Promise<void>;
  fetchUserProfile: (userId: string) => void;
  ensureProfileExists: (user: SupabaseAuthUser) => void;
  updateUserProfile: (data: Partial<UserProfileType>) => Promise<boolean>;
  uploadUserAvatar: (file: File) => Promise<string | null>;
  deleteUserProfile: () => Promise<boolean>;
  // Maybe a separate method for full account deletion if you handle it via client->backend->supabase
  // deleteUserAccount: () => Promise<boolean>;
};

// Create the Provider component
type UserProviderPropsType = {
  children: ReactNode;
};

type CheckAuthPropsType = {
  isAuthenticated: boolean;
  user: Partial<UserProfileType> | null;
  children: ReactNode;
};

export type {
  CartItemType,
  CartPropsType,
  CheckAuthPropsType,
  PhaseType,
  CourseType,
  CohortType,
  CourseVariantType,
  CohortVariantType,
  LaunchTimerPropsType,
  ModuleType,
  SessionType,
  PricingCardPropsType,
  ProfileInputFieldType,
  ProfileType,
  UserContextType,
  UserProfileType,
  UserProviderPropsType,
};
