
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPin, Clock, ChevronLeft, Briefcase, Loader2, UserCircle } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

type Job = Database['public']['Tables']['jobs']['Row'];
type Application = Database['public']['Tables']['applications']['Row'] & {
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  }
};

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isApplying, setIsApplying] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isRecruiter = profile?.user_type === "recruiter";
  const isOwnJob = isRecruiter && job?.recruiter_id === user?.id;
  const [existingApplication, setExistingApplication] = useState<{id: string, recording_url: string | null} | null>(null);
  
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

        // Check if the user has already applied to this job
        if (user && profile?.user_type === "student") {
          const { data: applicationData, error: applicationError } = await supabase
            .from("applications")
            .select("id, recording_url")
            .eq("job_id", id)
            .eq("student_id", user.id)
            .maybeSingle();

          if (!applicationError && applicationData) {
            setExistingApplication(applicationData);
          }
        }

        // If recruiter's own job, fetch all applications
        if (profile?.user_type === "recruiter") {
          fetchApplications(data);
        }
      } catch (err: any) {
        console.error("Error fetching job:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, user, profile?.user_type]);

  const fetchApplications = async (jobData: Job) => {
    if (!user || profile?.user_type !== "recruiter") return;
    
    try {
      setLoadingApplications(true);
      
      // Only fetch applications if the recruiter owns this job
      if (jobData.recruiter_id === user.id) {
        const { data: applicationsData, error: applicationsError } = await supabase
          .from("applications")
          .select(`
            *,
            profiles:student_id (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq("job_id", id)
          .order("created_at", { ascending: false });

        if (applicationsError) throw applicationsError;
        setApplications(applicationsData as Application[]);
      }
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      toast.error("Failed to load applications");
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleSubmitRecording = async (videoBlob: Blob, recordingUrl?: string) => {
    if (!user || !job) {
      toast.error("You must be logged in to apply");
      return;
    }

    try {
      console.log("Creating application record with recording URL:", recordingUrl);
      
      // First, create a new application record with a valid status value
      const { data: application, error: applicationError } = await supabase
        .from("applications")
        .insert({
          job_id: job.id,
          student_id: user.id,
          status: "completed", // Updated to use a valid status value
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          recording_url: recordingUrl || null // Store the recording URL
        })
        .select()
        .single();

      if (applicationError) {
        console.error("Application creation error:", applicationError);
        throw applicationError;
      }
      
      console.log("Application created successfully:", application);
      
      toast.success("Your application has been submitted successfully!");
      setIsApplying(false);
      
      // Update existing application state
      setExistingApplication({
        id: application.id,
        recording_url: application.recording_url
      });
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
    title: job?.title || "",
    description: job?.task_instructions || "",
    instructions: job?.requirements || [],
    timeLimit: 60 // minutes
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
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
              {job.requirements.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="secondary" className="font-normal">
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
            
            {/* Only show application controls for students, not recruiters */}
            {!isRecruiter && (
              <div className="mt-6 pt-6 border-t border-border/40">
                <h3 className="font-medium mb-3">Required Task</h3>
                <p className="text-sm text-foreground/90 mb-4">
                  To apply for this position, you'll need to complete a task that demonstrates your skills. Your screen will be recorded during task completion.
                </p>
                
                {existingApplication ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-md text-center">
                      <p className="text-sm mb-2">You have already applied to this job.</p>
                      {existingApplication.recording_url && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            navigate(`/student/applications`);
                          }}
                        >
                          View Your Application
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
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
                      <ScreenRecorder 
                        task={taskMock} 
                        onSubmit={handleSubmitRecording} 
                        jobId={id}
                        existingApplicationId={existingApplication?.id}
                        existingRecordingUrl={existingApplication?.recording_url || undefined}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
            
            {/* For recruiters, show info about job management instead of application controls */}
            {isRecruiter && isOwnJob && (
              <div className="mt-6 pt-6 border-t border-border/40">
                <h3 className="font-medium mb-3">Job Management</h3>
                <p className="text-sm text-foreground/90 mb-4">
                  As the recruiter who posted this job, you can view and review all applications.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/recruiter/dashboard")}
                >
                  Manage All Jobs
                </Button>
              </div>
            )}
            
            {isRecruiter && !isOwnJob && (
              <div className="mt-6 pt-6 border-t border-border/40">
                <p className="text-sm text-foreground/90 mb-4">
                  You're viewing this job as a recruiter. Only students can apply for jobs.
                </p>
              </div>
            )}
          </div>
          
          <div className="text-center p-4 rounded-lg glass-panel">
            <p className="text-sm text-muted-foreground">
              By applying, you agree to our privacy policy and consent to having your screen recorded for skill verification purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Show applications only for recruiters who own this job */}
      {isRecruiter && isOwnJob && (
        <div className="mt-8">
          <Separator className="my-8" />
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Job Applications
            </h2>
          </div>
          
          {loadingApplications ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : applications.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium overflow-hidden">
                              {application.profiles?.avatar_url ? (
                                <img 
                                  src={application.profiles.avatar_url} 
                                  alt={`${application.profiles.first_name} ${application.profiles.last_name}`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <UserCircle className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {application.profiles?.first_name} {application.profiles?.last_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/recruiter/applications/${application.id}`)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No applications have been submitted yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;
