
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import AIReviewPanel from "@/components/ai/AIReviewPanel";
import RecordingPreview from "@/components/tasks/components/RecordingPreview";

type ApplicationData = Database['public']['Tables']['applications']['Row'];
type ProfileData = Database['public']['Tables']['profiles']['Row'];
type JobData = Database['public']['Tables']['jobs']['Row'];
type AIReviewData = Database['public']['Tables']['ai_reviews']['Row'];
type FeedbackData = Database['public']['Tables']['recruiter_feedback']['Row'];

interface CodeQualityMetrics {
  correctness: number;
  efficiency: number;
  best_practices: number;
}

interface CommunicationMetrics {
  clarity: number;
  confidence: number;
  content: number;
}

const StudentApplicationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [recruiter, setRecruiter] = useState<ProfileData | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [aiReview, setAIReview] = useState<AIReviewData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Fetch application
        const { data: applicationData, error: applicationError } = await supabase
          .from('applications')
          .select('*')
          .eq('id', id)
          .single();

        if (applicationError) {
          if (applicationError.code === 'PGRST116') {
            console.error("Application not found:", applicationError);
            setNotFound(true);
          } else {
            throw applicationError;
          }
          return;
        }
        
        setApplication(applicationData);

        // Fetch job details
        if (applicationData?.job_id) {
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', applicationData.job_id)
            .single();

          if (jobError) {
            console.error("Job fetch error:", jobError);
            if (jobError.code !== 'PGRST116') {
              throw jobError;
            }
          } else {
            setJob(jobData);

            // Fetch recruiter profile
            if (jobData?.recruiter_id) {
              const { data: recruiterData, error: recruiterError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', jobData.recruiter_id)
                .single();

              if (recruiterError) {
                console.error("Recruiter fetch error:", recruiterError);
                if (recruiterError.code !== 'PGRST116') {
                  throw recruiterError;
                }
              } else {
                setRecruiter(recruiterData);
              }
            }
          }
        }

        // Fetch AI review if application is completed
        if (applicationData?.status === 'completed' || 
            applicationData?.status === 'reviewing' || 
            applicationData?.status === 'accepted' || 
            applicationData?.status === 'rejected') {
          const { data: aiReviewData, error: aiReviewError } = await supabase
            .from('ai_reviews')
            .select('*')
            .eq('application_id', id)
            .single();

          if (!aiReviewError) {
            setAIReview(aiReviewData);
          } else if (aiReviewError.code !== 'PGRST116') {
            console.error("AI review fetch error:", aiReviewError);
          }
        }

        // Fetch feedback if available
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('recruiter_feedback')
          .select('*')
          .eq('application_id', id)
          .single();

        if (!feedbackError) {
          setFeedback(feedbackData);
        } else if (feedbackError.code !== 'PGRST116') {
          console.error("Feedback fetch error:", feedbackError);
        }
      } catch (error) {
        console.error("Error fetching application data:", error);
        toast.error("Failed to load application data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const playRecording = () => {
    if (videoRef.current && application?.recording_url) {
      videoRef.current.src = application.recording_url;
      videoRef.current.play().catch(err => {
        console.error("Error playing recording:", err);
        setVideoError(true);
        toast.error("Error playing recording");
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !application || !job) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-4">Application not found</h1>
        <p>The application you're looking for doesn't exist or you don't have permission to view it.</p>
      </div>
    );
  }

  // Process code quality metrics from aiReview if it exists
  let codeQualityMetrics: CodeQualityMetrics = {
    correctness: 0,
    efficiency: 0,
    best_practices: 0
  };

  let communicationMetrics: CommunicationMetrics | undefined;

  if (aiReview?.code_quality) {
    try {
      // Try to parse if it's a string, or use directly if it's already an object
      if (typeof aiReview.code_quality === 'string') {
        codeQualityMetrics = JSON.parse(aiReview.code_quality as string);
      } else if (typeof aiReview.code_quality === 'object') {
        // Ensure required properties exist before assignment
        const codeQuality = aiReview.code_quality as Record<string, any>;
        codeQualityMetrics = {
          correctness: codeQuality.correctness || 0,
          efficiency: codeQuality.efficiency || 0,
          best_practices: codeQuality.best_practices || 0
        };
      }
    } catch (e) {
      console.error("Error parsing code quality metrics:", e);
    }
  }

  const isCompleted = application.status !== 'pending' && application.status !== 'in_progress';
  const taskType = job.task_type?.toLowerCase() || 'coding';

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
            {job.company}
          </span>
          <span className="bg-muted px-3 py-1 rounded-full text-sm">
            Status: {application.status.replace('_', ' ')}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Applied:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
                {application.started_at && (
                  <p><strong>Started:</strong> {new Date(application.started_at).toLocaleDateString()}</p>
                )}
                {application.completed_at && (
                  <p><strong>Completed:</strong> {new Date(application.completed_at).toLocaleDateString()}</p>
                )}
                <p><strong>Status:</strong> {application.status.replace('_', ' ')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Company:</strong> {job.company}</p>
                <p><strong>Posted by:</strong> {recruiter ? `${recruiter.first_name} ${recruiter.last_name}` : 'Unknown'}</p>
                <p><strong>Task Type:</strong> {job.task_type}</p>
                <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue={application.recording_url ? "recording" : "results"} className="w-full">
        <TabsList className="mb-6">
          {application.recording_url && <TabsTrigger value="recording">Your Recording</TabsTrigger>}
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {application.recording_url && (
          <TabsContent value="recording" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <RecordingPreview 
                  status="completed" 
                  videoRef={videoRef} 
                  recordingUrl={application.recording_url} 
                  onPlayRecording={playRecording}
                  isPlayback={true}
                />
                <p className="text-sm text-muted-foreground mt-4">
                  This is your recording submitted on {new Date(application.completed_at || application.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="results" className="space-y-6">
          {aiReview ? (
            <AIReviewPanel 
              score={aiReview.score}
              feedback={{
                summary: aiReview.summary,
                strengths: aiReview.strengths,
                areas_to_improve: aiReview.areas_to_improve,
                code_quality: codeQualityMetrics,
                communication: communicationMetrics,
                overall_recommendation: aiReview.overall_recommendation
              }}
              taskType={taskType as 'coding' | 'design' | 'presentation'}
            />
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Results are not available yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {feedback ? (
                <div className="prose dark:prose-invert max-w-none">
                  <p>{feedback.feedback}</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Last updated: {new Date(feedback.updated_at).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No feedback has been provided yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {application.status === 'pending' && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Your application is pending. You'll be able to start the task soon.</p>
          </CardContent>
        </Card>
      )}

      {application.status === 'in_progress' && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Your task is in progress. Complete it before the deadline.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentApplicationPage;
