import React, { useState, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [videoPlaybackError, setVideoPlaybackError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("instructions");
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [showNoDataDialog, setShowNoDataDialog] = useState(false);
  const [isStartingAutomatically, setIsStartingAutomatically] = useState(false);
  
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
    playRecording,
    recordedChunksCount
  } = useScreenRecording({ timeLimit });

  useEffect(() => {
    if (status === 'recording' && activeTab !== 'recording') {
      setActiveTab('recording');
    }
    
    if (status !== 'idle') {
      setRecordingError(null);
    }

    if (activeTab === 'recording' && status === 'idle' && !isStartingAutomatically) {
      console.log("Auto-starting recording from tab change");
      setIsStartingAutomatically(true);
      startRecording().catch(err => {
        console.error("Error auto-starting recording:", err);
      }).finally(() => {
        setIsStartingAutomatically(false);
      });
    }
  }, [status, activeTab]);

  useEffect(() => {
    if (!jobId || !user) {
      setIsCheckingApplication(false);
      return;
    }

    const checkExistingApplication = async () => {
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("id, recording_url")
          .eq("job_id", jobId)
          .eq("student_id", user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setHasAlreadyApplied(true);
          if (data.recording_url) {
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
    if (existingRecordingUrl && videoRef.current) {
      videoRef.current.src = existingRecordingUrl;
      
      const handleVideoError = () => {
        console.error("Error loading video from URL:", existingRecordingUrl);
        setVideoPlaybackError("Error loading video. The recording might be unavailable.");
      };
      
      videoRef.current.onerror = handleVideoError;
      
      return () => {
        if (videoRef.current) {
          videoRef.current.onerror = null;
        }
      };
    }
  }, [existingRecordingUrl, videoRef]);

  const handleTabChange = (value: string) => {
    if (value === 'instructions' && (status === 'recording' || status === 'paused')) {
      const confirmSwitch = window.confirm("Switching tabs during recording may cause issues. Do you want to stop recording first?");
      if (confirmSwitch) {
        stopRecording()
          .then(() => setActiveTab(value))
          .catch(err => {
            console.error("Error stopping recording during tab switch:", err);
            toast.error("Failed to stop recording. Please try the stop button.");
          });
      }
      return;
    }
    
    setActiveTab(value);

    if (value === 'recording' && status === 'idle' && !isStartingAutomatically) {
      console.log("Auto-starting recording from tab change");
      setIsStartingAutomatically(true);
      startRecording().catch(err => {
        console.error("Error auto-starting recording:", err);
      }).finally(() => {
        setIsStartingAutomatically(false);
      });
    }
  };

  const handleSubmitRecording = async () => {
    if (!recordingBlob || recordedChunks.length === 0) {
      console.error("No recording data available for submission");
      console.log("Blob exists:", !!recordingBlob);
      console.log("Recorded chunks:", recordedChunks.length);
      
      if (status === "recording" || status === "paused") {
        toast.info("Finalizing recording before submission...");
        try {
          await stopRecording();
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
          console.error("Error stopping recording:", e);
        }
      }
      
      if (!recordingBlob || recordedChunks.length === 0) {
        setShowNoDataDialog(true);
        return;
      }
    }
    
    if (recordingBlob && recordingBlob.size < 1000) {
      setRecordingError("The recording appears to be empty or invalid. Please try again.");
      return;
    }

    if (hasAlreadyApplied && !existingApplicationId) {
      toast.error("You have already applied to this job");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let uploadedUrl = null;
      
      if (user && recordingBlob) {
        const fileName = `recording_${user.id}_${Date.now()}.webm`;
        
        console.log("Uploading recording to Supabase Storage");
        console.log("Bucket: recordings");
        console.log("File name:", fileName);
        console.log("File size:", recordingBlob.size, "bytes");
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('recordings')
          .upload(fileName, recordingBlob, {
            contentType: 'video/webm',
            upsert: true
          });

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          throw uploadError;
        }
        
        console.log("Upload successful:", uploadData);
        
        const { data: publicUrlData } = await supabase.storage
          .from('recordings')
          .getPublicUrl(fileName);
          
        uploadedUrl = publicUrlData.publicUrl;
        console.log("Public URL:", uploadedUrl);
      } else {
        console.error("No user is authenticated or no recording blob available");
        if (!user) {
          throw new Error("You must be logged in to submit a recording");
        }
        if (!recordingBlob) {
          throw new Error("Recording failed to capture any data");
        }
      }
      
      if (recordingBlob) {
        onSubmit(recordingBlob, uploadedUrl);
        toast.success("Recording submitted for review");
      } else {
        throw new Error("No recording data available");
      }
    } catch (error: any) {
      console.error("Error uploading recording:", error);
      toast.error(`Error uploading recording: ${error.message}`);
      setRecordingError(`Failed to upload: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryRecording = () => {
    setShowNoDataDialog(false);
    setRecordingError(null);
    startRecording();
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
          {videoPlaybackError ? (
            <div className="p-6 bg-destructive/10 rounded-md text-center">
              <p className="text-destructive font-medium">{videoPlaybackError}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The recording might have been removed or is temporarily unavailable.
              </p>
            </div>
          ) : (
            <RecordingPreview 
              status="completed" 
              videoRef={videoRef}
              recordingUrl={existingRecordingUrl}
              onPlayRecording={playRecording}
              isPlayback={true}
            />
          )}
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
        <Tabs value={activeTab} onValueChange={handleTabChange}>
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
          recordingError={recordingError}
          recordedChunksCount={recordedChunksCount}
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

      <AlertDialog open={showNoDataDialog} onOpenChange={setShowNoDataDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No Recording Data</AlertDialogTitle>
            <AlertDialogDescription>
              No recording data was captured. This could be due to browser permissions or 
              settings that prevented the screen recording from working correctly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={retryRecording}>Try Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ScreenRecorder;
