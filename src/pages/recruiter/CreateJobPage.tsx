
import React from "react";
import CreateJobForm from "@/components/jobs/CreateJobForm";

const CreateJobPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
      <p className="text-muted-foreground mb-8">
        Create a new job listing and find the perfect candidate
      </p>
      <CreateJobForm />
    </div>
  );
};

export default CreateJobPage;
