
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPin, Clock, ChevronLeft, Briefcase, Loader2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";

type Job = Database['public']['Tables']['jobs']['Row'];

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isApplying, setIsApplying] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (err: any) {
        console.error("Error fetching job:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleSubmitRecording = async (videoBlob: Blob) => {
    if (!user || !job) {
      toast.error("You must be logged in to apply");
      return;
    }

    try {
      // First, create a new application record
      const { data: application, error: applicationError } = await supabase
        .from("applications")
        .insert({
          job_id: job.id,
          student_id: user.id,
          status: "submitted",
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (applicationError) throw applicationError;

      // Upload the recording to Supabase storage would go here
      // For now, we'll just simulate success
      
      toast.success("Your application has been submitted successfully!");
      setIsApplying(false);
      
      // Redirect to the student dashboard
      navigate("/student/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Error submitting application");
      console.error("Error submitting application:", err);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive">Error loading job details</h2>
          <p className="text-muted-foreground mt-2">{error || "Job not found"}</p>
          <Button asChild className="mt-4">
            <Link to="/jobs">Back to Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const taskMock = {
    id: "task1",
    title: job.title,
    description: job.task_instructions,
    instructions: job.requirements,
    timeLimit: 60 // minutes
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
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{job.title}</h1>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <span className="font-medium">{job.company}</span>
                    <span className="mx-2">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Remote</span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant={job.task_type === "coding" ? "default" : "outline"} className="md:self-start">
                {job.task_type === "coding" ? "Full-time" : 
                 job.task_type === "design" ? "Contract" :
                 job.task_type === "writing" ? "Part-time" : "Internship"}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {job.requirements.slice(0, 6).map((skill) => (
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
                  {job.requirements.slice(0, 5).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-3">Requirements</h2>
                <ul className="list-disc pl-5 space-y-1 text-foreground/90">
                  {job.requirements.slice(5).map((item, index) => (
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
                  <p className="text-foreground/90">{formatDate(job.created_at)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-accent p-2 rounded-full mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Application Deadline</h3>
                  <p className="text-foreground/90">{formatDate(job.deadline)}</p>
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
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      if (!user) {
                        toast.error("You must be logged in to apply");
                        navigate("/login");
                        return;
                      }
                      if (profile?.user_type !== "student") {
                        toast.error("Only students can apply for jobs");
                        return;
                      }
                    }}
                  >
                    Apply for this Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Complete Task to Apply</DialogTitle>
                    <DialogDescription>
                      Your screen will be recorded as you complete this task. This helps us evaluate your skills.
                    </DialogDescription>
                  </DialogHeader>
                  <ScreenRecorder task={taskMock} onSubmit={handleSubmitRecording} />
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
