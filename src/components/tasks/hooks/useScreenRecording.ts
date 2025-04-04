
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
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      // Clean up any objectURL when component unmounts
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
      }
    };
  }, [stream, recordingUrl]);

  // Tab visibility warning
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

  // Automatic stop recording when time limit is reached
  useEffect(() => {
    // Check if recording time exceeds time limit (in minutes)
    if (status === "recording" && recordingTime >= timeLimit * 60) {
      toast.info(`Time limit of ${timeLimit} minutes reached. Stopping recording.`);
      stopRecording();
    }
  }, [recordingTime, timeLimit, status]);

  const startRecording = async () => {
    setStatus("preparing");
    try {
      // Reset recorded chunks and URL when starting a new recording
      setRecordedChunks([]);
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
        setRecordingUrl(null);
      }
      setRecordingBlob(null);
      setRecordingTime(0);
      setWarningShown(false);

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

      // Only try to get audio if available
      let audioStream: MediaStream;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: false,
        });
      } catch (error) {
        console.warn("Could not capture audio, proceeding with video only:", error);
        audioStream = new MediaStream();
      }

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
      
      // Add event listener for when user stops sharing screen
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
        toast.info("Screen sharing ended. Recording stopped.");
      });
      
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
    if (mediaRecorder && (status === "recording" || status === "paused")) {
      setStatus("processing");
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Ensure mediaRecorder is in a state where it can be stopped
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        
        // Create a new Promise to handle the final dataavailable event
        const recordingPromise = new Promise<Blob>((resolve) => {
          mediaRecorder.addEventListener('stop', () => {
            // Create a blob from all chunks
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setRecordingBlob(blob);
            setRecordingUrl(url);
            
            // If there's a video element, set the source to the recording
            if (videoRef.current) {
              videoRef.current.srcObject = null;
              videoRef.current.src = url;
            }
            
            resolve(blob);
          });
        });
        
        recordingPromise.then(() => {
          setStatus("completed");
          toast.success("Recording completed successfully");
        });
      } else {
        // If the mediaRecorder is already inactive, create the blob directly
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingBlob(blob);
        setRecordingUrl(url);
        
        // If there's a video element, set the source to the recording
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
        }
        
        setStatus("completed");
        toast.success("Recording completed successfully");
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Play the recording in the video element if available
  const playRecording = () => {
    if (videoRef.current && recordingUrl) {
      videoRef.current.src = recordingUrl;
      videoRef.current.play().catch(err => {
        console.error("Error playing recording:", err);
        toast.error("Error playing recording");
      });
    }
  };

  return {
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
  };
};
