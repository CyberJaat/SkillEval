
import React, { useEffect } from "react";
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
  useEffect(() => {
    // If in playback mode and there's a recording URL, set it as the source
    if (isPlayback && recordingUrl && videoRef.current) {
      videoRef.current.src = recordingUrl;
    }
  }, [isPlayback, recordingUrl, videoRef]);

  return (
    <div className="aspect-video bg-black/20 rounded-md overflow-hidden relative">
      {status === "idle" && !isPlayback && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <p>Start recording to see preview</p>
        </div>
      )}
      
      {isPlayback && recordingUrl && status !== "recording" && status !== "preparing" ? (
        <div className="relative">
          <video 
            ref={videoRef} 
            className="w-full h-full" 
            controls={isPlayback}
          />
          {!videoRef.current?.playing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Button 
                variant="outline" 
                className="rounded-full p-3"
                onClick={onPlayRecording}
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
