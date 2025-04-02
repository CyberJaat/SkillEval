
import React from "react";
import { Helmet } from "react-helmet";
import CreateJobForm from "@/components/jobs/CreateJobForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const CreateJobPage = () => {
  const { user, profile } = useAuth();

  // Make sure only recruiters can access this page
  if (user && profile && profile.user_type !== "recruiter") {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Post a New Job | TaskBridge</title>
      </Helmet>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
        <p className="text-muted-foreground mb-8">
          Create a new job listing and find the perfect candidate
        </p>
        <CreateJobForm />
      </div>
    </>
  );
};

export default CreateJobPage;
