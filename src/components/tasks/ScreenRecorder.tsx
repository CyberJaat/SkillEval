
import React from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScreenRecording } from "./hooks/useScreenRecording";
import RecordingControls from "./components/RecordingControls";
import RecordingTimer from "./components/RecordingTimer";
import RecordingPreview from "./components/RecordingPreview";
import StatusAlerts from "./components/StatusAlerts";
import RecordingInstructions from "./components/RecordingInstructions";

interface TaskDetails {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  timeLimit?: number; // in minutes
}

interface ScreenRecorderProps {
  task: TaskDetails;
  onSubmit: (videoBlob: Blob) => void;
}

const ScreenRecorder: React.FC<ScreenRecorderProps> = ({ task, onSubmit }) => {
  const timeLimit = task.timeLimit || 60; // Default 60 minutes if not specified
  
  const {
    status,
    recordingTime,
    recordedChunks,
    videoRef,
    isFullScreen,
    warningShown,
    formatTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording
  } = useScreenRecording({ timeLimit });

  const handleSubmitRecording = () => {
    if (recordedChunks.length === 0) {
      toast.error("No recording available to submit");
      return;
    }
    
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    onSubmit(blob);
    toast.success("Recording submitted for AI review");
  };

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
        <CardDescription>
          Complete the task while recording your screen. Time limit: {timeLimit} minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="instructions">
          <TabsList className="w-full">
            <TabsTrigger value="instructions" className="flex-1">Instructions</TabsTrigger>
            <TabsTrigger value="recording" className="flex-1">Recording Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="instructions" className="p-4 border rounded-md">
            <RecordingInstructions task={task} />
          </TabsContent>
          <TabsContent value="recording">
            <RecordingPreview status={status} videoRef={videoRef} />
          </TabsContent>
        </Tabs>
        
        <RecordingTimer 
          status={status} 
          formattedTime={formatTime(recordingTime)} 
        />
        
        <StatusAlerts 
          isFullScreen={isFullScreen} 
          warningShown={warningShown} 
          status={status} 
        />
      </CardContent>
      <CardFooter className="flex justify-center">
        <RecordingControls 
          status={status}
          onStart={startRecording}
          onPause={pauseRecording}
          onResume={resumeRecording}
          onStop={stopRecording}
          onSubmit={handleSubmitRecording}
        />
      </CardFooter>
    </Card>
  );
};

export default ScreenRecorder;
