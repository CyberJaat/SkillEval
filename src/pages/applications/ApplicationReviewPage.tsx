
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import { Loader2, PlayCircle, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import AIReviewPanel from "@/components/ai/AIReviewPanel";
import RecordingPreview from "@/components/tasks/components/RecordingPreview";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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

const ApplicationReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [student, setStudent] = useState<ProfileData | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [aiReview, setAIReview] = useState<AIReviewData | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [existingFeedback, setExistingFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [acceptingRejecting, setAcceptingRejecting] = useState<boolean>(false);
  const [isRequestingAIReview, setIsRequestingAIReview] = useState<boolean>(false);
  const [isPlaybackOpen, setIsPlaybackOpen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch application data
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

        if (applicationError) throw applicationError;
        setApplication(applicationData);

        // Fetch student profile
        if (applicationData?.student_id) {
          const { data: studentData, error: studentError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', applicationData.student_id)
            .single();

          if (studentError) throw studentError;
          setStudent(studentData);
        }

        // Fetch job details
        if (applicationData?.job_id) {
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', applicationData.job_id)
            .single();

          if (jobError) throw jobError;
          setJob(jobData);
        }

        // Fetch AI review
        const { data: aiReviewData, error: aiReviewError } = await supabase
          .from('ai_reviews')
          .select('*')
          .eq('application_id', id)
          .single();

        if (!aiReviewError) {
          setAIReview(aiReviewData);
        }

        // Fetch existing feedback
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('recruiter_feedback')
          .select('*')
          .eq('application_id', id)
          .single();

        if (!feedbackError && feedbackData) {
          setExistingFeedback(feedbackData);
          setFeedback(feedbackData.feedback);
        }
      } catch (error) {
        console.error("Error fetching application data:", error);
        toast.error("Failed to load application data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFeedbackSubmit = async () => {
    if (!id) return;
    setSubmitting(true);

    try {
      if (existingFeedback) {
        // Update existing feedback
        const { error } = await supabase
          .from('recruiter_feedback')
          .update({
            feedback,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingFeedback.id);

        if (error) throw error;
      } else {
        // Create new feedback
        const { error } = await supabase
          .from('recruiter_feedback')
          .insert({
            application_id: id,
            feedback,
          });

        if (error) throw error;
      }

      toast.success("Feedback saved successfully");

      // Refresh feedback data
      const { data: updatedFeedback, error: fetchError } = await supabase
        .from('recruiter_feedback')
        .select('*')
        .eq('application_id', id)
        .single();

      if (fetchError) throw fetchError;
      setExistingFeedback(updatedFeedback);
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Failed to save feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplicationStatusUpdate = async (status: 'accepted' | 'rejected') => {
    if (!id || !application) return;

    setAcceptingRejecting(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setApplication({
        ...application,
        status,
        updated_at: new Date().toISOString(),
      });

      toast.success(`Application ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`);
    } catch (error) {
      console.error(`Error ${status === 'accepted' ? 'accepting' : 'rejecting'} application:`, error);
      toast.error(`Failed to ${status === 'accepted' ? 'accept' : 'reject'} application`);
    } finally {
      setAcceptingRejecting(false);
    }
  };

  const requestAIReview = async () => {
    if (!id || !application || !job) return;
    
    setIsRequestingAIReview(true);
    try {
      // Check if an AI review already exists
      if (aiReview) {
        const confirmOverwrite = window.confirm("An AI review already exists. Do you want to request a new one?");
        if (!confirmOverwrite) {
          setIsRequestingAIReview(false);
          return;
        }
      }
      
      // Mock AI review generation (in a real app, this would call an AI service)
      // This is a simplified example - in a production app you'd call an API or edge function
      const taskType = job.task_type?.toLowerCase() || 'coding';
      
      const mockAIReview = {
        application_id: id,
        score: 3.8,
        summary: "This submission demonstrates solid foundational skills with some areas for improvement.",
        strengths: [
          "Clear approach to problem-solving",
          "Good code organization",
          "Effective use of available APIs"
        ],
        areas_to_improve: [
          "Could improve error handling",
          "Some edge cases not addressed",
          "Documentation could be more comprehensive"
        ],
        code_quality: JSON.stringify({
          correctness: 4.0,
          efficiency: 3.5,
          best_practices: 3.9
        }),
        overall_recommendation: "Consider this candidate for the next round. They have demonstrated sufficient skills for the role but would benefit from mentoring in certain areas."
      };
      
      // Insert or update the AI review in the database
      const { data, error } = await supabase
        .from('ai_reviews')
        .upsert({
          ...mockAIReview,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'application_id'
        });
        
      if (error) throw error;
      
      toast.success("AI review generated successfully");
      
      // Fetch the updated AI review
      const { data: updatedAIReview, error: fetchError } = await supabase
        .from('ai_reviews')
        .select('*')
        .eq('application_id', id)
        .single();
        
      if (fetchError) throw fetchError;
      setAIReview(updatedAIReview);
      
    } catch (error) {
      console.error("Error generating AI review:", error);
      toast.error("Failed to generate AI review");
    } finally {
      setIsRequestingAIReview(false);
    }
  };

  const sendAIGeneratedFeedback = async () => {
    if (!aiReview || !id) return;
    
    setSubmitting(true);
    try {
      // Generate feedback based on AI review
      const aiGeneratedFeedback = `Based on our review of your submission:

Strengths:
${aiReview.strengths.map(s => `- ${s}`).join('\n')}

Areas to Improve:
${aiReview.areas_to_improve.map(a => `- ${a}`).join('\n')}

Overall Assessment:
${aiReview.overall_recommendation}

Your score: ${aiReview.score}/5

Thank you for your application.`;
      
      // Update the feedback state
      setFeedback(aiGeneratedFeedback);
      
      // Save to database
      if (existingFeedback) {
        const { error } = await supabase
          .from('recruiter_feedback')
          .update({
            feedback: aiGeneratedFeedback,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingFeedback.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('recruiter_feedback')
          .insert({
            application_id: id,
            feedback: aiGeneratedFeedback,
          });

        if (error) throw error;
      }
      
      toast.success("AI-generated feedback sent to applicant");
      
      // Refresh feedback data
      const { data: updatedFeedback, error: fetchError } = await supabase
        .from('recruiter_feedback')
        .select('*')
        .eq('application_id', id)
        .single();

      if (fetchError) throw fetchError;
      setExistingFeedback(updatedFeedback);
      
    } catch (error) {
      console.error("Error sending AI feedback:", error);
      toast.error("Failed to send AI-generated feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const playRecording = () => {
    if (videoRef.current && application?.recording_url) {
      videoRef.current.src = application.recording_url;
      videoRef.current.play().catch(err => {
        console.error("Error playing recording:", err);
        toast.error("Error playing the recording");
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

  if (!application || !student || !job) {
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
              <CardTitle>Applicant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Name:</strong> {student.first_name} {student.last_name}</p>
                <p><strong>School:</strong> {student.school || 'Not specified'}</p>
                <p><strong>Major:</strong> {student.major || 'Not specified'}</p>
                <p><strong>Applied:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
                {application.completed_at && (
                  <p><strong>Completed:</strong> {new Date(application.completed_at).toLocaleDateString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Task Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Task Type:</strong> {job.task_type}</p>
                <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
                {application.recording_url && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Applicant Recording</h3>
                    <Button 
                      onClick={() => setIsPlaybackOpen(true)} 
                      variant="outline" 
                      className="flex items-center gap-2"
                    >
                      <PlayCircle className="h-4 w-4" />
                      View Recording
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="ai-review" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="ai-review">AI Review</TabsTrigger>
          <TabsTrigger value="recruiter-feedback">Recruiter Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="ai-review" className="space-y-6">
          {aiReview ? (
            <>
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
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={sendAIGeneratedFeedback}
                  disabled={submitting}
                >
                  <Send className="h-4 w-4" />
                  Send AI Feedback to Applicant
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No AI review available for this application yet.</p>
                <Button 
                  onClick={requestAIReview} 
                  disabled={isRequestingAIReview}
                  className="flex items-center gap-2"
                >
                  {isRequestingAIReview ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isRequestingAIReview ? "Generating Review..." : "Generate AI Review"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="recruiter-feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Provide feedback to the applicant..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[200px] mb-4"
              />
              <div className="flex justify-between">
                <div>
                  <Button onClick={handleFeedbackSubmit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save & Send Feedback'
                    )}
                  </Button>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleApplicationStatusUpdate('rejected')}
                    disabled={acceptingRejecting || application.status === 'rejected'}
                  >
                    {acceptingRejecting && application.status !== 'rejected' ? 'Rejecting...' : 'Reject Application'}
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => handleApplicationStatusUpdate('accepted')}
                    disabled={acceptingRejecting || application.status === 'accepted'}
                  >
                    {acceptingRejecting && application.status !== 'accepted' ? 'Accepting...' : 'Accept Application'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recording Playback Sheet */}
      <Sheet open={isPlaybackOpen} onOpenChange={setIsPlaybackOpen}>
        <SheetContent className="w-full md:max-w-[800px] sm:max-w-full">
          <SheetHeader>
            <SheetTitle>Applicant Recording</SheetTitle>
            <SheetDescription>
              Recording submitted by {student.first_name} {student.last_name} on {new Date(application.completed_at || application.created_at).toLocaleDateString()}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <RecordingPreview 
              status="completed" 
              videoRef={videoRef}
              recordingUrl={application.recording_url || undefined}
              onPlayRecording={playRecording}
              isPlayback={true}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ApplicationReviewPage;
