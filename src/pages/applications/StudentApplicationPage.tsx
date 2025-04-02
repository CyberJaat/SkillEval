
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Download } from "lucide-react";
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
  recruiterFeedback: "Thank you for your application. We were impressed with your React skills and problem-solving approach. Your code was well-structured and your solution met all the requirements. We'd like to proceed to the next round of interviews.",
  aiReview: {
    score: 4.2,
    feedback: {
      summary: "You demonstrated strong React skills with good understanding of state management and component lifecycle. Your code was well-structured and followed best practices for the most part.",
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
      overall_recommendation: "Based on your code quality and task completion, you would be a strong candidate for the Frontend Developer position. Your understanding of React fundamentals is solid, and you demonstrate good problem-solving skills."
    },
    taskType: "coding"
  }
};

const StudentApplicationPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, we would fetch application details based on id
  const application = mockApplication;
  
  const handleDownloadRecording = () => {
    // This would typically download the video recording
    toast.success("Your recording is being downloaded");
  };
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link to="/student/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{application.jobTitle}</h1>
          <p className="text-muted-foreground">
            Application for {application.company}
          </p>
        </div>
        <div>
          <Button variant="outline" onClick={handleDownloadRecording}>
            <Download className="mr-2 h-4 w-4" />
            Download Recording
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="recording" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="recording">Your Recording</TabsTrigger>
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
              <CardTitle>Recruiter Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {application.recruiterFeedback ? (
                <p className="text-foreground/90">{application.recruiterFeedback}</p>
              ) : (
                <p className="text-muted-foreground">No feedback provided yet.</p>
              )}
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
          
          <div className="text-center glass-panel p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Your application is being reviewed. You'll receive updates via email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentApplicationPage;
