
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertTriangle, XCircle, Award } from "lucide-react";

interface AIReviewProps {
  score: number;
  feedback: {
    summary: string;
    strengths: string[];
    areas_to_improve: string[];
    code_quality?: {
      correctness: number;
      efficiency: number;
      best_practices: number;
    };
    communication?: {
      clarity: number;
      confidence: number;
      content: number;
    };
    overall_recommendation: string;
  };
  taskType: "coding" | "design" | "presentation";
}

const AIReviewPanel: React.FC<AIReviewProps> = ({ score, feedback, taskType }) => {
  const renderScoreBadge = (score: number) => {
    if (score >= 4.0) {
      return (
        <Badge className="bg-green-600 text-white">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Excellent
        </Badge>
      );
    } else if (score >= 3.0) {
      return (
        <Badge className="bg-blue-600 text-white">
          <Award className="mr-1 h-3 w-3" /> Good
        </Badge>
      );
    } else if (score >= 2.0) {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
          <AlertTriangle className="mr-1 h-3 w-3" /> Needs Improvement
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" /> Unsatisfactory
        </Badge>
      );
    }
  };

  const renderDetailScores = () => {
    if (taskType === "coding" && feedback.code_quality) {
      return (
        <div className="space-y-4 mt-4">
          <h4 className="font-medium text-sm">Code Quality Breakdown</h4>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm">Correctness</span>
                <span className="text-sm font-medium">{feedback.code_quality.correctness.toFixed(1)}/5.0</span>
              </div>
              <Progress value={feedback.code_quality.correctness * 20} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm">Efficiency</span>
                <span className="text-sm font-medium">{feedback.code_quality.efficiency.toFixed(1)}/5.0</span>
              </div>
              <Progress value={feedback.code_quality.efficiency * 20} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm">Best Practices</span>
                <span className="text-sm font-medium">{feedback.code_quality.best_practices.toFixed(1)}/5.0</span>
              </div>
              <Progress value={feedback.code_quality.best_practices * 20} className="h-2" />
            </div>
          </div>
        </div>
      );
    } else if (taskType === "presentation" && feedback.communication) {
      return (
        <div className="space-y-4 mt-4">
          <h4 className="font-medium text-sm">Communication Breakdown</h4>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm">Clarity</span>
                <span className="text-sm font-medium">{feedback.communication.clarity.toFixed(1)}/5.0</span>
              </div>
              <Progress value={feedback.communication.clarity * 20} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm">Confidence</span>
                <span className="text-sm font-medium">{feedback.communication.confidence.toFixed(1)}/5.0</span>
              </div>
              <Progress value={feedback.communication.confidence * 20} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm">Content Relevance</span>
                <span className="text-sm font-medium">{feedback.communication.content.toFixed(1)}/5.0</span>
              </div>
              <Progress value={feedback.communication.content * 20} className="h-2" />
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>AI Assessment</CardTitle>
            <CardDescription>Automated review of your task submission</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold">{score.toFixed(1)}</div>
            <div className="text-lg text-muted-foreground">/5.0</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Overall Rating</h3>
          {renderScoreBadge(score)}
        </div>
        
        <p className="text-sm text-foreground/90">{feedback.summary}</p>
        
        {renderDetailScores()}
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Strengths</h4>
          <ul className="space-y-1">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Areas to Improve</h4>
          <ul className="space-y-1">
            {feedback.areas_to_improve.map((area, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-4 p-3 rounded-md bg-muted/40">
          <h4 className="font-medium text-sm">Recommendation</h4>
          <p className="text-sm mt-1">{feedback.overall_recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIReviewPanel;
