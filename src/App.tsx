
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import AboutPage from "./pages/about/AboutPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import JobsPage from "./pages/jobs/JobsPage";
import JobDetailsPage from "./pages/jobs/JobDetailsPage";
import RecruiterDashboardPage from "./pages/dashboard/RecruiterDashboardPage";
import StudentDashboardPage from "./pages/dashboard/StudentDashboardPage";
import ApplicationReviewPage from "./pages/applications/ApplicationReviewPage";
import StudentApplicationPage from "./pages/applications/StudentApplicationPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import RequireAuth from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/recruiter/dashboard" element={
                <RequireAuth userType="recruiter">
                  <RecruiterDashboardPage />
                </RequireAuth>
              } />
              <Route path="/recruiter/applications/:id" element={
                <RequireAuth userType="recruiter">
                  <ApplicationReviewPage />
                </RequireAuth>
              } />
              <Route path="/student/dashboard" element={
                <RequireAuth userType="student">
                  <StudentDashboardPage />
                </RequireAuth>
              } />
              <Route path="/student/applications/:id" element={
                <RequireAuth userType="student">
                  <StudentApplicationPage />
                </RequireAuth>
              } />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
