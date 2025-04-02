
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
                    <h3 className="font-semibold mb-2">Recording</h3>
                    <a 
                      href={application.recording_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Recording
                    </a>
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
              <Card>
                <CardHeader>
                  <CardTitle>Overall Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{aiReview.score}/5</span>
                    <p className="mt-2">{aiReview.summary}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Correctness</h3>
                      <div className="text-3xl font-bold">{codeQualityMetrics.correctness}/5</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Efficiency</h3>
                      <div className="text-3xl font-bold">{codeQualityMetrics.efficiency}/5</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Best Practices</h3>
                      <div className="text-3xl font-bold">{codeQualityMetrics.best_practices}/5</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {aiReview.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Areas to Improve</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {aiReview.areas_to_improve.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{aiReview.overall_recommendation}</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">No AI review available for this application yet.</p>
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
                      'Save Feedback'
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
    </div>
  );
};

export default ApplicationReviewPage;
