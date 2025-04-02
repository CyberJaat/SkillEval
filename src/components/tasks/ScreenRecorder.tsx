
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Video, Pause, Play, Stop, AlertTriangle, CheckCircle2 } from "lucide-react";

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
  const [status, setStatus] = useState<"idle" | "preparing" | "recording" | "paused" | "processing" | "completed">("idle");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [warningShown, setWarningShown] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);

  const timeLimit = task.timeLimit || 60; // Default 60 minutes if not specified

  useEffect(() => {
    return () => {
      // Clean up when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  useEffect(() => {
    // Set up anti-tab-switching detection
    const handleVisibilityChange = () => {
      if (document.hidden && status === "recording" && !warningShown) {
        toast.warning("Tab switching detected! Your recording may be invalidated.");
        setWarningShown(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, warningShown]);

  const startRecording = async () => {
    setStatus("preparing");
    try {
      // Request screen capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          cursor: "always",
          displaySurface: "monitor",
        },
        audio: true,
      });

      // Optional: Also capture microphone audio
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false,
      });

      // Combine the streams
      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      setStream(combinedStream);

      // Display preview
      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
      }

      // Create media recorder
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      // Set up event listeners
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      setMediaRecorder(recorder);
      
      // Start recording after setup
      recorder.start(1000); // Collect data every second
      setStatus("recording");
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("Recording started successfully");
    } catch (error) {
      console.error("Error starting screen recording:", error);
      setStatus("idle");
      toast.error("Failed to start recording. Please make sure you've granted the necessary permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && status === "recording") {
      mediaRecorder.pause();
      setStatus("paused");
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      toast.info("Recording paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && status === "paused") {
      mediaRecorder.resume();
      setStatus("recording");
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      toast.info("Recording resumed");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      setStatus("processing");
      mediaRecorder.stop();
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setTimeout(() => {
        setStatus("completed");
        toast.success("Recording completed successfully");
      }, 1000);
    }
  };

  const submitRecording = () => {
    if (recordedChunks.length === 0) {
      toast.error("No recording available to submit");
      return;
    }
    
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    onSubmit(blob);
    toast.success("Recording submitted for AI review");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  const renderControlButtons = () => {
    switch (status) {
      case "idle":
        return (
          <Button onClick={startRecording} className="w-full">
            <Video className="mr-2 h-4 w-4" /> Start Recording
          </Button>
        );
      case "preparing":
        return (
          <Button disabled className="w-full">
            Preparing...
          </Button>
        );
      case "recording":
        return (
          <div className="flex gap-2">
            <Button variant="outline" onClick={pauseRecording}>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
            <Button variant="destructive" onClick={stopRecording}>
              <Stop className="mr-2 h-4 w-4" /> Stop Recording
            </Button>
          </div>
        );
      case "paused":
        return (
          <div className="flex gap-2">
            <Button variant="outline" onClick={resumeRecording}>
              <Play className="mr-2 h-4 w-4" /> Resume
            </Button>
            <Button variant="destructive" onClick={stopRecording}>
              <Stop className="mr-2 h-4 w-4" /> Stop Recording
            </Button>
          </div>
        );
      case "processing":
        return (
          <Button disabled className="w-full">
            Processing...
          </Button>
        );
      case "completed":
        return (
          <Button onClick={submitRecording} className="w-full">
            <CheckCircle2 className="mr-2 h-4 w-4" /> Submit Recording
          </Button>
        );
      default:
        return null;
    }
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
            <ScrollArea className="h-64">
              <div className="space-y-4">
                <p className="text-sm">{task.description}</p>
                <div className="space-y-2">
                  <h4 className="font-medium">Steps to follow:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {task.instructions.map((instruction, index) => (
                      <li key={index} className="text-sm">{instruction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="recording">
            <div className="aspect-video bg-black/20 rounded-md overflow-hidden relative">
              {status === "idle" ? (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <p>Start recording to see preview</p>
                </div>
              ) : (
                <video ref={videoRef} className="w-full h-full" autoPlay muted />
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {status !== "idle" && status !== "preparing" && (
          <div className="flex justify-between items-center p-2 bg-muted/40 rounded-md">
            <div className="flex items-center">
              {status === "recording" && (
                <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse" />
              )}
              <span className="text-sm font-medium">
                {status === "recording" ? "Recording" : 
                 status === "paused" ? "Paused" : 
                 status === "completed" ? "Recording Complete" : 
                 status === "processing" ? "Processing" : ""}
              </span>
            </div>
            <div className="text-sm font-mono">
              {formatTime(recordingTime)}
            </div>
          </div>
        )}
        
        {warningShown && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Tab switching detected during recording. This may invalidate your submission.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {renderControlButtons()}
      </CardFooter>
    </Card>
  );
};

export default ScreenRecorder;
