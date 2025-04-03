
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface UseScreenRecordingProps {
  timeLimit: number;
}

export const useScreenRecording = ({ timeLimit }: UseScreenRecordingProps) => {
  const [status, setStatus] = useState<"idle" | "preparing" | "recording" | "paused" | "processing" | "completed">("idle");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [warningShown, setWarningShown] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === "recording" && !isFullScreen && !warningShown) {
        toast.warning("Tab switching detected! Your recording may be invalidated.");
        setWarningShown(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, warningShown, isFullScreen]);

  const startRecording = async () => {
    setStatus("preparing");
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          displaySurface: "monitor",
        },
        audio: true,
      });

      // Check if entire screen is shared
      const videoTrack = displayStream.getVideoTracks()[0];
      // @ts-ignore - displaySurface exists on browser implementations but not in TypeScript types
      const isEntireScreen = videoTrack?.getSettings()?.displaySurface === "monitor";
      setIsFullScreen(isEntireScreen);

      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false,
      });

      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      setStream(combinedStream);

      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      setMediaRecorder(recorder);
      
      recorder.start(1000);
      setStatus("recording");
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("Recording started successfully");
      
      if (isEntireScreen) {
        toast.info("Full screen detected. You may switch tabs while recording.");
      } else {
        toast.info("Tab recording detected. Please don't switch tabs during recording.");
      }
      
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
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
  };
};
