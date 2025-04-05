
import React from "react";
import { Button } from "@/components/ui/button";
import { Video, Pause, Play, Square, CheckCircle2, Loader2 } from "lucide-react";

interface RecordingControlsProps {
  status: "idle" | "preparing" | "recording" | "paused" | "processing" | "completed";
  isSubmitting?: boolean;
  onStart: () => Promise<void>;
  onPause: () => void;
  onResume: () => void;
  onStop: () => Promise<void>; // Changed to Promise<void> for proper async handling
  onSubmit: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  status,
  isSubmitting = false,
  onStart,
  onPause,
  onResume,
  onStop,
  onSubmit
}) => {
  const [isStoppingRecording, setIsStoppingRecording] = React.useState(false);

  // Handle stop recording with loading state
  const handleStopRecording = async () => {
    if (isStoppingRecording) return;
    
    setIsStoppingRecording(true);
    try {
      await onStop();
    } finally {
      setIsStoppingRecording(false);
    }
  };

  switch (status) {
    case "idle":
      return (
        <Button onClick={onStart} className="w-full">
          <Video className="mr-2 h-4 w-4" /> Start Recording
        </Button>
      );
    case "preparing":
      return (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing...
        </Button>
      );
    case "recording":
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPause}>
            <Pause className="mr-2 h-4 w-4" /> Pause
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleStopRecording} 
            disabled={isStoppingRecording}
          >
            {isStoppingRecording ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Square className="mr-2 h-4 w-4" />
            )}
            {isStoppingRecording ? "Stopping..." : "Stop Recording"}
          </Button>
        </div>
      );
    case "paused":
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onResume}>
            <Play className="mr-2 h-4 w-4" /> Resume
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleStopRecording} 
            disabled={isStoppingRecording}
          >
            {isStoppingRecording ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Square className="mr-2 h-4 w-4" />
            )}
            {isStoppingRecording ? "Stopping..." : "Stop Recording"}
          </Button>
        </div>
      );
    case "processing":
      return (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
        </Button>
      );
    case "completed":
      return (
        <Button 
          onClick={onSubmit} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Submit Recording
            </>
          )}
        </Button>
      );
    default:
      return null;
  }
};

export default RecordingControls;
