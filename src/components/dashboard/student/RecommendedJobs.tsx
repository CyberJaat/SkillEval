
import React from "react";
import JobCard, { JobListing } from "@/components/jobs/JobCard";

// Mock data - these would typically be tailored based on student profile
const recommendedJobs: JobListing[] = [
  {
    id: "rec1",
    title: "Junior Frontend Developer",
    company: "StartupXYZ",
    location: "Remote",
    type: "Full-time",
    posted: "1 day ago",
    deadline: "in 14 days",
    skills: ["React", "HTML", "CSS", "JavaScript"],
    description: "Great opportunity for a junior developer to gain experience with modern web technologies in a supportive environment.",
  },
  {
    id: "rec2",
    title: "UI Developer Intern",
    company: "DesignHub",
    location: "New York, NY",
    type: "Internship",
    posted: "3 days ago",
    deadline: "in 21 days",
    skills: ["HTML", "CSS", "JavaScript", "Figma"],
    description: "Join our design team to work on converting mockups into functional UIs for web applications.",
  },
  {
    id: "rec3",
    title: "React Native Developer",
    company: "MobileApps Inc.",
    location: "Remote",
    type: "Contract",
    posted: "5 days ago",
    deadline: "in 10 days",
    skills: ["React Native", "JavaScript", "Mobile Development"],
    description: "Work on exciting mobile app projects for various clients using React Native.",
  },
];

const RecommendedJobs = () => {
  return (
    <div className="space-y-4">
      {recommendedJobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
      
      <div className="text-center pt-4">
        <p className="text-muted-foreground">
          These recommendations are based on your profile and skills.
        </p>
      </div>
    </div>
  );
};

export default RecommendedJobs;
