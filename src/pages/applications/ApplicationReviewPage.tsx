import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Save, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AIReviewPanel from "@/components/ai/AIReviewPanel";
import { toast } from "sonner";

// Mock application data
const mockApplication = {
  id: "app1",
  studentName: "John Smith",
  jobTitle: "Frontend Developer",
  company: "TechCorp",
  appliedDate: "October 18, 2023",
  status: "completed",
  videoUrl: "https://example.com/recording.mp4", // This would be a real URL in production
  aiReview: {
    score: 4.2,
    feedback: {
      summary: "John demonstrated strong React skills with good understanding of state management and component lifecycle. The code was well-structured and followed best practices for the most part.",
      strengths: [
        "Clean and readable code structure",
        "Effective use of React hooks",
        "Good component organization",
        "Responsive design implementation"
      ],
      areas_to_improve: [
        "Could optimize performance with memoization",
        "Some components could be further broken down",
        "Add more comprehensive error handling"
      ],
      code_quality: {
        correctness: 4.5,
        efficiency: 3.8,
        best_practices: 4.3
      },
      overall_recommendation: "Based on the code quality and task completion, John would be a strong candidate for the Frontend Developer position. His understanding of React fundamentals is solid, and he demonstrates good problem-solving skills."
    },
    taskType: "coding" as const
  }
};

const ApplicationReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // In a real app, we would fetch application details based on id
  const application = mockApplication;
  
  const handleSaveNotes = () => {
    setIsSaving(true);
    // This would typically be an API call to save notes
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Notes saved successfully");
    }, 1000);
  };
  
  const handleSendFeedback = () => {
    setIsSending(true);
    // This would typically be an API call to send feedback
    setTimeout(() => {
      setIsSending(false);
      toast.success("Feedback sent to the applicant");
    }, 1500);
  };
  
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
          <h1 className="text-3xl font-bold">{application.studentName}</h1>
          <p className="text-muted-foreground">
            Application for {application.jobTitle} at {application.company}
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
                    {/* In a real app, this would be a video player component */}
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <p>Video player would be integrated here</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Submitted on {application.appliedDate}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ai-review" className="p-0 mt-4">
              <AIReviewPanel 
                score={application.aiReview.score} 
                feedback={application.aiReview.feedback} 
                taskType={application.aiReview.taskType} 
              />
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
                <p className="text-foreground/90">{application.appliedDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">AI Score</h3>
                <p className="text-foreground/90">{application.aiReview.score.toFixed(1)}/5.0</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationReviewPage;
