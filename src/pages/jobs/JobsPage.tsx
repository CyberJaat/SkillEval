
import React from "react";
import JobList from "@/components/jobs/JobList";

const JobsPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
      <p className="text-muted-foreground mb-8">
        Find your next opportunity among our curated job listings
      </p>
      <JobList />
    </div>
  );
};

export default JobsPage;
