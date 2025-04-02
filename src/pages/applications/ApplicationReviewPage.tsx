
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Save, Send, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AIReviewPanel from "@/components/ai/AIReviewPanel";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ApplicationWithRelations = Database['public']['Tables']['applications']['Row'] & {
  job: Database['public']['Tables']['jobs']['Row'];
  student: Database['public']['Tables']['profiles']['Row'];
};

type AIReview = Database['public']['Tables']['ai_reviews']['Row'];
type RecruiterFeedback = Database['public']['Tables']['recruiter_feedback']['Row'];

const ApplicationReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<ApplicationWithRelations | null>(null);
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [existingFeedback, setExistingFeedback] = useState<RecruiterFeedback | null>(null);
  
  useEffect(() => {
    if (!id || !user) return;
    
    const fetchApplicationData = async () => {
      try {
        // Fetch application data
        const { data: applicationData, error: applicationError } = await supabase
          .from('applications')
          .select(`
            *,
            job:jobs(*),
            student:profiles(*)
          `)
          .eq("id", id)
          .single();
          
        if (applicationError) throw applicationError;
        setApplication(applicationData);
        
        // Fetch AI review
        const { data: reviewData, error: reviewError } = await supabase
          .from('ai_reviews')
          .select("*")
          .eq("application_id", id)
          .single();
          
        if (!reviewError) {
          setAiReview(reviewData);
        }
        
        // Fetch existing feedback
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('recruiter_feedback')
          .select("*")
          .eq("application_id", id)
          .single();
          
        if (!feedbackError && feedbackData) {
          setExistingFeedback(feedbackData);
          setRecruiterNotes(feedbackData.feedback);
        }
      } catch (error) {
        console.error("Error fetching application data:", error);
        toast.error("Failed to load application data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplicationData();
  }, [id, user]);
  
  const handleSaveNotes = async () => {
    if (!id || !user) return;
    
    setIsSaving(true);
    try {
      if (existingFeedback) {
        // Update existing feedback
        const { error } = await supabase
          .from('recruiter_feedback')
          .update({ 
            feedback: recruiterNotes, 
            updated_at: new Date().toISOString() 
          })
          .eq("id", existingFeedback.id);
          
        if (error) throw error;
      } else {
        // Create new feedback
        const { error } = await supabase
          .from('recruiter_feedback')
          .insert({
            application_id: id,
            feedback: recruiterNotes
          });
          
        if (error) throw error;
        
        // Update local state
        const { data } = await supabase
          .from('recruiter_feedback')
          .select("*")
          .eq("application_id", id)
          .single();
          
        setExistingFeedback(data);
      }
      
      toast.success("Notes saved successfully");
    } catch (error: any) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSendFeedback = async () => {
    if (!id || !user) return;
    
    setIsSending(true);
    try {
      // First save the feedback if not already saved
      if (!existingFeedback || existingFeedback.feedback !== recruiterNotes) {
        await handleSaveNotes();
      }
      
      // Update application status to a more appropriate one
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: "completed", 
          updated_at: new Date().toISOString() 
        })
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success("Feedback sent to the applicant");
    } catch (error: any) {
      console.error("Error sending feedback:", error);
      toast.error("Failed to send feedback");
    } finally {
      setIsSending(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading application data...</p>
        </div>
      </div>
    );
  }
  
  if (!application) {
    return (
      <div className="container py-8">
        <div className="text-center glass-panel p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
          <p className="text-muted-foreground mb-6">The application you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate("/recruiter/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link to="/recruiter/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{application.student?.first_name} {application.student?.last_name}</h1>
          <p className="text-muted-foreground">
            Application for {application.job?.title} at {application.job?.company}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSendFeedback} disabled={isSending}>
            <Send className="mr-2 h-4 w-4" />
            {isSending ? "Sending..." : "Send Feedback"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="recording" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="recording">Task Recording</TabsTrigger>
              <TabsTrigger value="ai-review">AI Review</TabsTrigger>
            </TabsList>
            <TabsContent value="recording" className="p-0 mt-4">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Task Recording</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-md overflow-hidden">
                    {application.recording_url ? (
                      <video 
                        src={application.recording_url} 
                        className="w-full h-full" 
                        controls
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <p>No recording available</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Submitted on {application.completed_at ? new Date(application.completed_at).toLocaleDateString() : 'Not completed yet'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ai-review" className="p-0 mt-4">
              {aiReview ? (
                <AIReviewPanel 
                  score={aiReview.score} 
                  feedback={{
                    summary: aiReview.summary,
                    strengths: aiReview.strengths,
                    areas_to_improve: aiReview.areas_to_improve,
                    code_quality: aiReview.code_quality,
                    overall_recommendation: aiReview.overall_recommendation
                  }} 
                  taskType={application.job?.task_type as "coding" | "design" | "presentation"}
                />
              ) : (
                <Card className="glass-panel">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No AI review available for this application yet.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Recruiter Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Add your notes about this applicant..." 
                className="min-h-[250px]"
                value={recruiterNotes}
                onChange={(e) => setRecruiterNotes(e.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={handleSaveNotes} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">Status</h3>
                <p className="text-foreground/90 capitalize">{application.status}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Applied On</h3>
                <p className="text-foreground/90">{new Date(application.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">AI Score</h3>
                <p className="text-foreground/90">{aiReview ? `${aiReview.score.toFixed(1)}/5.0` : "Not available"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationReviewPage;
