
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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
      
      // Ensure mediaRecorder is properly stopped
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {
          console.error("Error stopping mediaRecorder during cleanup:", err);
        }
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

      console.log("Requesting screen share permissions...");
      
      // Request screen sharing
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          displaySurface: "monitor",
        },
        audio: true,
      });
      
      console.log("Screen share granted, checking display surface");

      // Check if entire screen is shared
      const videoTrack = displayStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      // @ts-ignore - displaySurface exists on browser implementations but not in TypeScript types
      const displaySurface = settings.displaySurface;
      const isEntireScreen = displaySurface === "monitor";
      
      console.log("Display surface:", displaySurface);
      setIsFullScreen(isEntireScreen);

      // Only try to get audio if available
      let audioStream: MediaStream;
      try {
        console.log("Requesting microphone permissions...");
        audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: false,
        });
        console.log("Microphone permissions granted");
      } catch (error) {
        console.warn("Could not capture audio, proceeding with video only:", error);
        audioStream = new MediaStream();
      }

      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      setStream(combinedStream);
      console.log("Combined stream created with tracks:", combinedStream.getTracks().length);

      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
        videoRef.current.muted = true; // Mute to avoid feedback
      }

      // Determine best MIME type
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      
      let mimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      if (!mimeType) {
        throw new Error("No supported video MIME type found on this browser");
      }
      
      console.log(`Using MIME type: ${mimeType}`);

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });
      
      console.log("MediaRecorder created with state:", recorder.state);

      recorder.ondataavailable = (event) => {
        console.log("Data available event:", event.data.size, "bytes");
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      setMediaRecorder(recorder);
      mediaRecorderRef.current = recorder;
      
      recorder.start(1000); // Capture chunks every second
      console.log("MediaRecorder started");
      
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
        console.log("Screen sharing ended by user");
        stopRecording();
        toast.info("Screen sharing ended. Recording stopped.");
      });
      
    } catch (error: any) {
      console.error("Error starting screen recording:", error);
      setStatus("idle");
      toast.error(`Failed to start recording: ${error.message || "Please make sure you've granted the necessary permissions."}`);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && status === "recording") {
      console.log("Pausing recording");
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
      console.log("Resuming recording");
      mediaRecorder.resume();
      setStatus("recording");
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      toast.info("Recording resumed");
    }
  };

  const stopRecording = () => {
    if ((mediaRecorder || mediaRecorderRef.current) && (status === "recording" || status === "paused")) {
      console.log("Stopping recording");
      setStatus("processing");
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      if (stream) {
        stream.getTracks().forEach(track => {
          console.log("Stopping track:", track.kind, track.label);
          track.stop();
        });
      }
      
      const recorder = mediaRecorder || mediaRecorderRef.current;
      
      // Ensure mediaRecorder is in a state where it can be stopped
      if (recorder && recorder.state !== "inactive") {
        try {
          // Create a new Promise to handle the final dataavailable event
          const recordingPromise = new Promise<Blob>((resolve) => {
            const stopHandler = () => {
              console.log("MediaRecorder stopped event fired");
              
              if (recordedChunks.length === 0) {
                console.warn("No recorded chunks available");
                toast.error("No recording data was captured. Please try again.");
                setStatus("idle");
                return;
              }
              
              // Create a blob from all chunks
              console.log(`Creating blob from ${recordedChunks.length} chunks`);
              const blob = new Blob(recordedChunks, { type: recorder.mimeType || 'video/webm' });
              console.log("Created blob of size:", blob.size, "bytes");
              
              const url = URL.createObjectURL(blob);
              setRecordingBlob(blob);
              setRecordingUrl(url);
              
              // If there's a video element, set the source to the recording
              if (videoRef.current) {
                videoRef.current.srcObject = null;
                videoRef.current.src = url;
                videoRef.current.muted = false; // Unmute for playback
              }
              
              resolve(blob);
            };
            
            recorder.addEventListener('stop', stopHandler, { once: true });
          });
          
          recorder.stop();
          
          recordingPromise.then(() => {
            setStatus("completed");
            toast.success("Recording completed successfully");
          }).catch(err => {
            console.error("Error finalizing recording:", err);
            setStatus("idle");
            toast.error("Error finalizing recording. Please try again.");
          });
        } catch (err) {
          console.error("Error stopping MediaRecorder:", err);
          setStatus("idle");
          toast.error("Error stopping recording. Please try again.");
        }
      } else {
        console.log("MediaRecorder already inactive, processing chunks directly");
        // If the mediaRecorder is already inactive, create the blob directly
        if (recordedChunks.length === 0) {
          console.warn("No recorded chunks available");
          setStatus("idle");
          toast.error("No recording data was captured. Please try again.");
          return;
        }
        
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingBlob(blob);
        setRecordingUrl(url);
        
        // If there's a video element, set the source to the recording
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
          videoRef.current.muted = false; // Unmute for playback
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
      console.log("Playing recording from URL:", recordingUrl);
      videoRef.current.src = recordingUrl;
      videoRef.current.play().catch(err => {
        console.error("Error playing recording:", err);
        toast.error("Error playing recording. Please try again.");
      });
    } else if (!recordingUrl) {
      console.error("No recording URL available to play");
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
