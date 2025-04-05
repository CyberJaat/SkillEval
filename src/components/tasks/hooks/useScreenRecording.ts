
import { useState, useRef, useEffect, useCallback } from "react";
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
  const [recordedChunksCount, setRecordedChunksCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const dataCheckerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isStoppingRef = useRef<boolean>(false);
  const visibilityChangeHandledRef = useRef<boolean>(false);
  const pageLoadEventSet = useRef<boolean>(false);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (dataCheckerRef.current) {
        window.clearInterval(dataCheckerRef.current);
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
  }, [recordingUrl]);

  // Prevent page reload/unload during recording
  useEffect(() => {
    if (!pageLoadEventSet.current && (status === "recording" || status === "paused")) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (status === "recording" || status === "paused") {
          e.preventDefault();
          e.returnValue = "You have an active recording. Are you sure you want to leave?";
          return e.returnValue;
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      pageLoadEventSet.current = true;
      
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        pageLoadEventSet.current = false;
      };
    }
  }, [status]);

  // Tab visibility warning with persistent recording
  useEffect(() => {
    // Only set up visibility handler if not already done
    if (!visibilityChangeHandledRef.current) {
      const handleVisibilityChange = () => {
        if (document.hidden && status === "recording" && !isFullScreen && !warningShown) {
          // Just show a warning without stopping the recording
          console.log("Tab switching detected, but continuing to record");
          setWarningShown(true);
          toast.warning("Tab switching detected! Your recording is still in progress.");
        }
      };
      
      document.addEventListener("visibilitychange", handleVisibilityChange);
      visibilityChangeHandledRef.current = true;
      
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        visibilityChangeHandledRef.current = false;
      };
    }
  }, [status, warningShown, isFullScreen]);

  // Automatic stop recording when time limit is reached
  useEffect(() => {
    // Check if recording time exceeds time limit (in minutes)
    if (status === "recording" && recordingTime >= timeLimit * 60) {
      toast.info(`Time limit of ${timeLimit} minutes reached. Stopping recording.`);
      stopRecording();
    }
  }, [recordingTime, timeLimit, status]);

  // This handles timer updates
  useEffect(() => {
    if (status === "recording") {
      const interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      
      timerRef.current = interval as unknown as number;
      
      return () => clearInterval(interval);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [status]);

  const startRecording = useCallback(async () => {
    // Prevent multiple start attempts or during stopping
    if (status !== "idle" || isStoppingRef.current) {
      console.log("Recording already in progress or stopping, status:", status);
      return;
    }
    
    setStatus("preparing");
    try {
      // Reset recorded chunks and URL when starting a new recording
      recordedChunksRef.current = [];
      setRecordedChunks([]);
      setRecordedChunksCount(0);
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
        setRecordingUrl(null);
      }
      setRecordingBlob(null);
      setRecordingTime(0);
      setWarningShown(false);

      console.log("Requesting screen share permissions...");
      
      // Request screen sharing with audio - use a more compatible configuration
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: true
      });
      
      console.log("Screen share granted, checking display surface");
      console.log("Video tracks:", displayStream.getVideoTracks().length);
      console.log("Audio tracks:", displayStream.getAudioTracks().length);

      // Check if entire screen is shared
      const videoTrack = displayStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      // @ts-ignore - displaySurface exists on browser implementations but not in TypeScript types
      const displaySurface = settings.displaySurface;
      const isEntireScreen = displaySurface === "monitor";
      
      console.log("Display surface:", displaySurface);
      setIsFullScreen(isEntireScreen);

      // Try to get microphone audio separately if not already captured
      let audioStream: MediaStream | null = null;
      if (!displayStream.getAudioTracks().length) {
        try {
          console.log("Requesting microphone permissions...");
          audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            }
          });
          console.log("Microphone permissions granted");
        } catch (error) {
          console.warn("Could not capture audio, proceeding with video only:", error);
        }
      } else {
        console.log("Audio already included in display stream");
      }

      // Combine all tracks
      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...displayStream.getAudioTracks(),
        ...(audioStream ? audioStream.getAudioTracks() : []),
      ]);

      setStream(combinedStream);
      streamRef.current = combinedStream;
      console.log("Combined stream created with tracks:", combinedStream.getTracks().length);
      console.log("Video tracks:", combinedStream.getVideoTracks().length);
      console.log("Audio tracks:", combinedStream.getAudioTracks().length);

      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
        videoRef.current.muted = true; // Mute to avoid feedback
        videoRef.current.onloadedmetadata = () => {
          console.log("Video element loaded metadata, ready to play");
          videoRef.current!.play().catch(err => console.error("Error playing video preview:", err));
        };
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

      // Create MediaRecorder with reliable options
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps - more compatible
        audioBitsPerSecond: 128000,  // 128 kbps
      });
      
      console.log("MediaRecorder created with state:", recorder.state);

      // Improved data handling
      recorder.ondataavailable = (event) => {
        console.log("Data available event:", event.data.size, "bytes");
        if (event.data && event.data.size > 0) {
          // Update both the ref and the state
          recordedChunksRef.current.push(event.data);
          setRecordedChunks(prev => [...prev, event.data]);
          setRecordedChunksCount(recordedChunksRef.current.length);
          console.log("Total chunks collected:", recordedChunksRef.current.length);
        }
      };

      // Error handling for recorder
      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast.error("Recording error occurred. Please try again.");
      };

      // Store the recorder
      setMediaRecorder(recorder);
      mediaRecorderRef.current = recorder;
      
      // Start capturing with a shorter timeslice to ensure we get data frequently
      recorder.start(1000); // Capture data every 1 second for more reliable data collection
      console.log("MediaRecorder started with timeslice of 1000ms");

      // Set up a data checker interval to monitor if we're getting data
      dataCheckerRef.current = window.setInterval(() => {
        if (recorder.state === 'recording') {
          console.log("Data check: chunks collected:", recordedChunksRef.current.length);
          recorder.requestData(); // Force the recorder to emit data every interval
        }
        
        // Periodically check if video stream is still active
        const videoTracks = combinedStream.getVideoTracks();
        if (videoTracks.length > 0) {
          const track = videoTracks[0];
          if (track.readyState === 'ended') {
            console.warn("Video track is no longer active, stopping recording");
            stopRecording();
          }
        }
      }, 1000) as unknown as number;
      
      // Set status to recording
      setStatus("recording");
      console.log("Recording status set to 'recording'");
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
  }, [recordingUrl, status]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder && status === "recording") {
      console.log("Pausing recording");
      mediaRecorder.pause();
      setStatus("paused");
      toast.info("Recording paused");
    }
  }, [mediaRecorder, status]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder && status === "paused") {
      console.log("Resuming recording");
      mediaRecorder.resume();
      setStatus("recording");
      toast.info("Recording resumed");
    }
  }, [mediaRecorder, status]);

  const stopRecording = useCallback(async () => {
    // Prevent concurrent stopping attempts
    if (isStoppingRef.current) {
      console.log("Already stopping recording, ignoring duplicate request");
      return Promise.resolve();
    }

    if ((mediaRecorder || mediaRecorderRef.current) && (status === "recording" || status === "paused")) {
      isStoppingRef.current = true;
      console.log("Stopping recording");
      setStatus("processing");
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (dataCheckerRef.current) {
        window.clearInterval(dataCheckerRef.current);
        dataCheckerRef.current = null;
      }
      
      // Force one last data capture before stopping
      if (mediaRecorder || mediaRecorderRef.current) {
        try {
          const recorder = mediaRecorder || mediaRecorderRef.current;
          if (recorder && recorder.state !== "inactive") {
            console.log("Requesting final data capture");
            recorder.requestData();
            
            // Small delay to allow data to be processed
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (e) {
          console.error("Error requesting final data:", e);
        }
      }
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          console.log("Stopping track:", track.kind, track.label);
          track.stop();
        });
        streamRef.current = null;
      }
      
      const recorder = mediaRecorder || mediaRecorderRef.current;
      
      try {
        console.log("Current chunks before stopping:", recordedChunksRef.current.length);
        
        // Promise-based approach for reliable stopping
        return new Promise<void>((resolve, reject) => {
          // Safety timeout
          const timeoutId = setTimeout(() => {
            console.log("Recording stop timeout triggered");
            isStoppingRef.current = false;
            
            if (recordedChunksRef.current.length === 0) {
              setStatus("idle");
              reject(new Error("No recording data was captured"));
            } else {
              processRecordedChunks(recordedChunksRef.current, recorder?.mimeType || 'video/webm')
                .then(() => {
                  setStatus("completed");
                  resolve();
                })
                .catch(error => {
                  setStatus("idle");
                  reject(error);
                });
            }
          }, 3000);
          
          // Only attempt to stop if recorder is still active
          if (recorder && recorder.state !== "inactive") {
            // Listen for the stop event
            recorder.addEventListener('stop', () => {
              clearTimeout(timeoutId);
              console.log("MediaRecorder stopped event fired");
              console.log(`Processing ${recordedChunksRef.current.length} chunks`);
              
              if (recordedChunksRef.current.length === 0) {
                console.error("No recorded chunks available after stop event");
                setStatus("idle");
                isStoppingRef.current = false;
                reject(new Error("No recording data was captured during the session"));
                return;
              }
              
              processRecordedChunks(recordedChunksRef.current, recorder.mimeType || 'video/webm')
                .then(() => {
                  setStatus("completed");
                  isStoppingRef.current = false;
                  resolve();
                })
                .catch(error => {
                  setStatus("idle");
                  isStoppingRef.current = false;
                  reject(error);
                });
            }, { once: true });
            
            try {
              recorder.stop();
              console.log("MediaRecorder.stop() called");
            } catch (e) {
              console.error("Error stopping recorder:", e);
              clearTimeout(timeoutId);
              isStoppingRef.current = false;
              
              // Try to process chunks anyway if we have them
              if (recordedChunksRef.current.length > 0) {
                processRecordedChunks(recordedChunksRef.current, recorder.mimeType || 'video/webm')
                  .then(() => {
                    setStatus("completed");
                    resolve();
                  })
                  .catch(error => {
                    setStatus("idle");
                    reject(error);
                  });
              } else {
                setStatus("idle");
                reject(new Error("Failed to stop recording and no data was captured"));
              }
            }
          } else {
            clearTimeout(timeoutId);
            console.log("MediaRecorder already inactive, processing chunks directly");
            isStoppingRef.current = false;
            
            // Handle the case when we already have chunks but recorder is inactive
            if (recordedChunksRef.current.length > 0) {
              processRecordedChunks(recordedChunksRef.current, 'video/webm')
                .then(() => {
                  setStatus("completed");
                  resolve();
                })
                .catch(error => {
                  setStatus("idle");
                  reject(error);
                });
            } else {
              console.error("No recorded chunks and recorder is inactive");
              setStatus("idle");
              reject(new Error("No recording data was captured"));
            }
          }
        });
      } catch (err: any) {
        console.error("Error in stopRecording flow:", err);
        setStatus("idle");
        isStoppingRef.current = false;
        toast.error(`Error stopping recording: ${err.message}. Please try again.`);
        throw err;
      }
    } else {
      return Promise.resolve();
    }
  }, [mediaRecorder, status]);

  const processRecordedChunks = async (chunks: Blob[], mimeType: string): Promise<Blob> => {
    console.log(`Processing ${chunks.length} recorded chunks`);
    
    if (!chunks.length) {
      throw new Error("No recording data was captured");
    }
    
    console.log(`Creating blob from ${chunks.length} chunks`);
    console.log("Chunk sizes:", chunks.map(c => c.size));
    
    // Filter out any zero-sized chunks
    const validChunks = chunks.filter(chunk => chunk.size > 0);
    
    if (validChunks.length === 0) {
      throw new Error("All recording chunks were empty");
    }
    
    const blob = new Blob(validChunks, { type: mimeType });
    console.log("Created blob of size:", blob.size, "bytes");
    
    if (blob.size <= 0) {
      throw new Error("Recording data was empty");
    }
    
    const url = URL.createObjectURL(blob);
    console.log("Created URL for blob:", url);
    setRecordingBlob(blob);
    setRecordingUrl(url);
    
    // If there's a video element, set the source to the recording
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      videoRef.current.muted = false; // Unmute for playback
      console.log("Set video element source to recording URL");
    }
    
    return blob;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const playRecording = useCallback(() => {
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
  }, [recordingUrl]);

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
    playRecording,
    recordedChunksCount
  };
};
