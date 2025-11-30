import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import {
  AdminHeader,
  CheckAuth,
  CourseList,
  DashboardAccountSetting,
  DashboardBasic,
  DashboardMembership,
  Footer,
  Header,
} from "./components/custom";
import { UserProvider, useUser } from "./contexts/UserContext";
import {
  Admin,
  CourseContent,
  CohortContent,
  LearningDashboard,
  Dashboard,
  Home,
  LoadingPage,
  MeetTheTeam,
  PageNotFound,
  Profile,
  Signin,
  PricingPage,
  PaymentSuccess,
  PaymentFailed,
  PrivacyPolicyPage,
  ContactUs
} from "./pages";

function App() {
  function AppContent() {
    const { currentUser, supabaseAuthUser, isAuthenticated, loadingUser } =
      useUser();

    console.log(currentUser, supabaseAuthUser, loadingUser, isAuthenticated);

    if (loadingUser) return <LoadingPage />;

    return (
      <Router>
        {currentUser?.role === "admin" ? <AdminHeader /> : <Header />}
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="*" element={<PageNotFound />} />

          <Route
            path="/"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <Home />
              </CheckAuth>
            }
          />

          <Route
            path="/signin"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <Signin />
              </CheckAuth>
            }
          />

          <Route
            path="/home"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <Home />
              </CheckAuth>
            }
          />
          <Route
            path="/meet-the-team"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <MeetTheTeam />
              </CheckAuth>
            }
          />
          <Route
            path="/learning-dashboard"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <LearningDashboard />
              </CheckAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <Dashboard />
              </CheckAuth>
            }
          >
            <Route path="basic" element={<DashboardBasic />} />
            <Route path="membership" element={<DashboardMembership />} />
            <Route path="setting" element={<DashboardAccountSetting />} />
          </Route>
          <Route
            path="/course-content/:courseID/:course_variant/:moduleID"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <CourseContent />
              </CheckAuth>
            }
          />
          <Route
            path="/cohort-content/:cohortID/:cohort_variant/:sessionID"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <CohortContent />
              </CheckAuth>
            }
          />
          <Route path="/pricing-page" element={<PricingPage />} />
          <Route
            path="/profile/:userID"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <Profile />
              </CheckAuth>
            }
          />

          <Route
            path="/payment-success"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <PaymentSuccess />
              </CheckAuth>
            }
          />
          <Route
            path="/payment-failed"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <PaymentFailed />
              </CheckAuth>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <PrivacyPolicyPage />
              </CheckAuth>
            }
          />
          <Route
            path="/contact-us"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <ContactUs />
              </CheckAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={currentUser}>
                <Admin />
              </CheckAuth>
            }
          >
            <Route path="course-list" element={<CourseList />} />
          </Route>
        </Routes>
        <Footer />
      </Router>
    );
  }

  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
