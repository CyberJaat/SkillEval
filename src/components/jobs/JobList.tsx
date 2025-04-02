
import React, { useState } from "react";
import JobCard, { JobListing } from "./JobCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

// Mock data
const mockJobs: JobListing[] = [
  {
    id: "job1",
    title: "Frontend Developer",
    company: "TechCorp",
    location: "Remote",
    type: "Full-time",
    posted: "2 days ago",
    deadline: "in 30 days",
    skills: ["React", "TypeScript", "Tailwind CSS"],
    description: "We're looking for a skilled frontend developer to join our team and build responsive web applications using modern technologies.",
  },
  {
    id: "job2",
    title: "Backend Engineer",
    company: "DataSystems",
    location: "New York, NY",
    type: "Full-time",
    posted: "1 week ago",
    deadline: "in 14 days",
    skills: ["Node.js", "Express", "MongoDB", "AWS"],
    description: "Join our backend team to develop scalable APIs and services that power our data-intensive applications.",
  },
  {
    id: "job3",
    title: "UI/UX Designer",
    company: "CreativeStudio",
    location: "San Francisco, CA",
    type: "Contract",
    posted: "3 days ago",
    deadline: "in 21 days",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
    description: "Help us create beautiful and intuitive user interfaces for our growing product suite.",
  },
  {
    id: "job4",
    title: "Data Scientist",
    company: "AnalyticsPro",
    location: "Hybrid",
    type: "Part-time",
    posted: "Just now",
    deadline: "in 7 days",
    skills: ["Python", "Machine Learning", "SQL", "Data Visualization"],
    description: "We need a data scientist to help us extract insights from our large datasets and build predictive models.",
  },
  {
    id: "job5",
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Remote",
    type: "Full-time",
    posted: "5 days ago",
    deadline: "in 10 days",
    skills: ["Docker", "Kubernetes", "CI/CD", "Linux"],
    description: "Join our DevOps team to build and maintain our cloud infrastructure and deployment pipelines.",
  },
];

const JobList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobType, setJobType] = useState<string | undefined>(undefined);

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !jobType || job.type === jobType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search jobs by title, company, skills..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select onValueChange={setJobType} value={jobType}>
            <SelectTrigger>
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-xl text-muted-foreground">No jobs found matching your criteria</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default JobList;
