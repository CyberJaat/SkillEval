
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
  children: React.ReactNode;
  userType?: "recruiter" | "student";
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, userType }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // If still loading, show a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If userType is specified and doesn't match the profile, redirect to appropriate dashboard
  if (userType && profile && profile.user_type !== userType) {
    const redirectPath = profile.user_type === "recruiter" 
      ? "/recruiter/dashboard" 
      : "/student/dashboard";
    
    return <Navigate to={redirectPath} replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default RequireAuth;
