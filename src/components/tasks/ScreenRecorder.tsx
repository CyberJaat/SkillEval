
import React, { useState, useEffect, useRef } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface TaskDetails {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  timeLimit?: number; // in minutes
}

interface ScreenRecorderProps {
  task: TaskDetails;
  onSubmit: (videoBlob: Blob, recordingUrl?: string) => void;
  jobId?: string;
  existingApplicationId?: string;
  existingRecordingUrl?: string;
}

const ScreenRecorder: React.FC<ScreenRecorderProps> = ({ 
  task, 
  onSubmit, 
  jobId,
  existingApplicationId,
  existingRecordingUrl 
}) => {
  const timeLimit = task.timeLimit || 60; // Default 60 minutes if not specified
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAlreadyApplied, setHasAlreadyApplied] = useState(false);
  const [isCheckingApplication, setIsCheckingApplication] = useState(!!jobId);
  
  const {
    status,
    recordingTime,
    recordedChunks,
    recordingBlob,
    recordingUrl,
    videoRef,
    isFullScreen,
    warningShown,
    formatTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    playRecording
  } = useScreenRecording({ timeLimit });

  // Check if the user has already applied to this job
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!jobId || !user) {
        setIsCheckingApplication(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("applications")
          .select("id, recording_url")
          .eq("job_id", jobId)
          .eq("student_id", user.id)
          .maybeSingle();

        if (error) throw error;
        
        // If there's already an application, set the flag
        if (data) {
          setHasAlreadyApplied(true);
          if (data.recording_url) {
            // If there's a recording URL, play it
            if (videoRef.current) {
              videoRef.current.src = data.recording_url;
            }
          }
        }
      } catch (error) {
        console.error("Error checking existing application:", error);
      } finally {
        setIsCheckingApplication(false);
      }
    };

    checkExistingApplication();
  }, [jobId, user, videoRef]);

  useEffect(() => {
    // If we have an existing recording URL, prepare the video player
    if (existingRecordingUrl && videoRef.current) {
      videoRef.current.src = existingRecordingUrl;
    }
  }, [existingRecordingUrl, videoRef]);

  const handleSubmitRecording = async () => {
    if (!recordingBlob) {
      toast.error("No recording available to submit");
      return;
    }

    if (hasAlreadyApplied && !existingApplicationId) {
      toast.error("You have already applied to this job");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload to Supabase Storage if we have a user
      let uploadedUrl = null;
      
      if (user) {
        // Create a filename with user ID and timestamp
        const fileName = `recording_${user.id}_${Date.now()}.webm`;
        
        // Upload to 'recordings' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('recordings')
          .upload(fileName, recordingBlob, {
            contentType: 'video/webm',
            upsert: true
          });

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = await supabase.storage
          .from('recordings')
          .getPublicUrl(fileName);
          
        uploadedUrl = publicUrlData.publicUrl;
      }
      
      // Call the onSubmit function with the recording blob and URL
      onSubmit(recordingBlob, uploadedUrl);
      toast.success("Recording submitted for review");
    } catch (error: any) {
      console.error("Error uploading recording:", error);
      toast.error(`Error uploading recording: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingApplication) {
    return (
      <Card className="glass-panel">
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Checking application status...</p>
        </CardContent>
      </Card>
    );
  }

  if (hasAlreadyApplied && !existingApplicationId) {
    return (
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>
            You have already applied to this job.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p>You can only apply once to each job listing.</p>
        </CardContent>
      </Card>
    );
  }

  if (existingRecordingUrl) {
    return (
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Your Submitted Recording</CardTitle>
          <CardDescription>
            Here is the recording you submitted for this application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecordingPreview 
            status="completed" 
            videoRef={videoRef}
            recordingUrl={existingRecordingUrl}
            onPlayRecording={playRecording}
            isPlayback={true}
          />
        </CardContent>
      </Card>
    );
  }

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
            <RecordingPreview 
              status={status} 
              videoRef={videoRef} 
              recordingUrl={recordingUrl}
              onPlayRecording={playRecording}
            />
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
          isSubmitting={isSubmitting}
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
