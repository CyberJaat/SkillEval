
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
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

const StudentApplicationPage = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [recruiter, setRecruiter] = useState<ProfileData | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [aiReview, setAIReview] = useState<AIReviewData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

        // Fetch job details
        if (applicationData?.job_id) {
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', applicationData.job_id)
            .single();

          if (jobError) throw jobError;
          setJob(jobData);

          // Fetch recruiter profile
          if (jobData?.recruiter_id) {
            const { data: recruiterData, error: recruiterError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', jobData.recruiter_id)
              .single();

            if (recruiterError) throw recruiterError;
            setRecruiter(recruiterData);
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

  if (loading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application || !job) {
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

  const isCompleted = application.status !== 'pending' && application.status !== 'in_progress';

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

      {isCompleted && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>
          <TabsContent value="results" className="space-y-6">
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
              </>
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
      )}

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
