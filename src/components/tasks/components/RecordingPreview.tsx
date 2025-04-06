
import React, { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingPreviewProps {
  status: "idle" | "preparing" | "recording" | "paused" | "processing" | "completed";
  videoRef: React.RefObject<HTMLVideoElement>;
  recordingUrl?: string | null;
  onPlayRecording?: () => void;
  isPlayback?: boolean;
}

const RecordingPreview: React.FC<RecordingPreviewProps> = ({ 
  status, 
  videoRef, 
  recordingUrl, 
  onPlayRecording,
  isPlayback = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If in playback mode and there's a recording URL, set it as the source
    if (isPlayback && recordingUrl && videoRef.current) {
      videoRef.current.src = recordingUrl;
      
      // Add error handler
      const handleError = () => {
        console.error("Video playback error:", videoRef.current?.error);
        setError("Error loading video. The recording might be unavailable.");
      };
      
      videoRef.current.onerror = handleError;
      
      return () => {
        if (videoRef.current) {
          videoRef.current.onerror = null;
        }
      };
    }
  }, [isPlayback, recordingUrl, videoRef]);

  useEffect(() => {
    // Add event listeners to track video play state
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [videoRef]);

  const handlePlayClick = () => {
    if (onPlayRecording) {
      setError(null);
      onPlayRecording();
    }
  };

  return (
    <div className="aspect-video bg-black/20 rounded-md overflow-hidden relative">
      {status === "idle" && !isPlayback && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <p>Start recording to see preview</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white">
          <p className="text-destructive font-semibold mb-2">{error}</p>
          <Button 
            variant="outline" 
            onClick={handlePlayClick}
          >
            Try Again
          </Button>
        </div>
      )}
      
      {isPlayback && recordingUrl && status !== "recording" && status !== "preparing" && !error ? (
        <div className="relative">
          <video 
            ref={videoRef} 
            className="w-full h-full" 
            controls={isPlayback}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Button 
                variant="outline" 
                className="rounded-full p-3"
                onClick={handlePlayClick}
              >
                <Play className="h-8 w-8" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <video 
          ref={videoRef} 
          className="w-full h-full" 
          autoPlay 
          muted={!isPlayback} 
          controls={isPlayback && status === "completed"}
        />
      )}
      
      {status === "completed" && recordingUrl && !isPlayback && (
        <div className="absolute bottom-4 right-4">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onPlayRecording}
          >
            <Play className="mr-2 h-4 w-4" />
            Review Recording
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecordingPreview;
