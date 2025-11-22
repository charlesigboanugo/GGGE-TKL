import type { CheckAuthPropsType } from "@/constants/types";
import { Navigate, useLocation } from "react-router-dom";

export default function CheckAuth({
  isAuthenticated,
  user,
  children,
}: CheckAuthPropsType) {
  const location = useLocation();

  const PUBLIC_ROUTES = [
    "/", // landing page
    "/signin", // login
    "/signup", // signup
    "/course-buying-page",
    "/home",
    "/meet-the-team",
  ];

  const ADMIN_ROUTES_PREFIX = "/admin";

  // --- Redirect Logic ---

  // 1. If user is NOT authenticated
  if (!isAuthenticated) {
    const isCurrentlyOnPublicPath = PUBLIC_ROUTES.includes(location.pathname);

    if (!isCurrentlyOnPublicPath) {
      // Not allowed → send to signin
      return <Navigate to="/signin" replace />;
    }
  }

  // 2. If user IS authenticated
  if (isAuthenticated) {
    // Trying to visit /signin or /signup while logged in → redirect away
    if (
      location.pathname.startsWith("/signin") ||
      location.pathname.startsWith("/signup")
    ) {
      if (user?.role === "admin") {
        return <Navigate to={`${ADMIN_ROUTES_PREFIX}/course-list`} replace />;
      } else {
        return <Navigate to="/home" replace />;
      }
    }

    const isUserAdmin = user?.role === "admin";
    const isTryingToAccessAdminPath =
      location.pathname.startsWith(ADMIN_ROUTES_PREFIX);

    // Admin trying to access non-admin path → force redirect to admin dashboard
    if (isUserAdmin && !isTryingToAccessAdminPath) {
      return <Navigate to={`${ADMIN_ROUTES_PREFIX}/course-list`} replace />;
    }

    // Non-admin trying to access admin path → boot to home
    if (!isUserAdmin && isTryingToAccessAdminPath) {
      return <Navigate to="/home" replace />;
    }

    // Profile route: only allow user to see their own profile
    if (location.pathname.startsWith("/profile/")) {
      const pathUserId = location.pathname.split("/")[2]; // /profile/:userId
      if (pathUserId !== user?.id) {
        return <Navigate to={`/profile/${user?.id}`} replace />;
      }
    }
  }

  // Otherwise → allow access
  return <>{children}</>;
}
