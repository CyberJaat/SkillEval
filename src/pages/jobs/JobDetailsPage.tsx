
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPin, Clock, ChevronLeft, Briefcase } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import ScreenRecorder from "@/components/tasks/ScreenRecorder";
import { toast } from "sonner";

// Mock job data
const mockJob = {
  id: "job1",
  title: "Frontend Developer",
  company: "TechCorp",
  location: "Remote",
  type: "Full-time",
  posted: "October 15, 2023",
  deadline: "November 15, 2023",
  companyLogo: "",
  skills: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
  description: "We're looking for a skilled frontend developer to join our team and build responsive web applications using modern technologies.",
  responsibilities: [
    "Develop and maintain responsive web applications using React",
    "Collaborate with designers to implement UI/UX designs",
    "Work with backend engineers to integrate APIs",
    "Write clean, maintainable, and efficient code",
    "Perform code reviews and mentor junior developers"
  ],
  requirements: [
    "2+ years of experience with React and modern JavaScript",
    "Proficiency with CSS and responsive design",
    "Experience with state management (Redux, Context API)",
    "Knowledge of RESTful API integration",
    "Bachelor's degree in Computer Science or related field (or equivalent experience)"
  ],
  task: {
    id: "task1",
    title: "Build a Simple Todo App",
    description: "Create a basic todo application using React that allows users to add, delete, and mark tasks as complete.",
    instructions: [
      "Create a new React application",
      "Implement a form to add new todo items",
      "Display a list of todo items with options to mark as complete or delete",
      "Implement basic styling using CSS or a CSS framework",
      "Ensure the application is responsive and works on mobile devices",
      "Add a filter to show all, active, or completed tasks"
    ],
    timeLimit: 60 // minutes
  }
};

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isApplying, setIsApplying] = useState(false);
  
  // In a real app, we would fetch job details based on id
  const job = mockJob;
  
  const handleSubmitRecording = (videoBlob: Blob) => {
    console.log("Submitting recording", videoBlob);
    // This would typically be an API call to upload the video
    setTimeout(() => {
      toast.success("Your task submission has been received and is being processed");
      setIsApplying(false);
    }, 1500);
  };
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link to="/jobs" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to Jobs</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-6 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                  {job.companyLogo ? (
                    <img 
                      src={job.companyLogo} 
                      alt={`${job.company} logo`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Briefcase className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{job.title}</h1>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <span className="font-medium">{job.company}</span>
                    <span className="mx-2">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant={job.type === "Full-time" ? "default" : "outline"} className="md:self-start">
                {job.type}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="font-normal">
                  {skill}
                </Badge>
              ))}
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-foreground/90">{job.description}</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-3">Responsibilities</h2>
                <ul className="list-disc pl-5 space-y-1 text-foreground/90">
                  {job.responsibilities.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-3">Requirements</h2>
                <ul className="list-disc pl-5 space-y-1 text-foreground/90">
                  {job.requirements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Application Process</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-accent p-2 rounded-full mt-0.5">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Posted on</h3>
                  <p className="text-foreground/90">{job.posted}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-accent p-2 rounded-full mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Application Deadline</h3>
                  <p className="text-foreground/90">{job.deadline}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border/40">
              <h3 className="font-medium mb-3">Required Task</h3>
              <p className="text-sm text-foreground/90 mb-4">
                To apply for this position, you'll need to complete a task that demonstrates your skills. Your screen will be recorded during task completion.
              </p>
              <Dialog open={isApplying} onOpenChange={setIsApplying}>
                <DialogTrigger asChild>
                  <Button className="w-full">Apply for this Job</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Complete Task to Apply</DialogTitle>
                    <DialogDescription>
                      Your screen will be recorded as you complete this task. This helps us evaluate your skills.
                    </DialogDescription>
                  </DialogHeader>
                  <ScreenRecorder task={job.task} onSubmit={handleSubmitRecording} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="text-center p-4 rounded-lg glass-panel">
            <p className="text-sm text-muted-foreground">
              By applying, you agree to our privacy policy and consent to having your screen recorded for skill verification purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
