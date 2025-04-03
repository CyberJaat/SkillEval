
import React from "react";
import { Button } from "@/components/ui/button";
import { Video, Pause, Play, Square, CheckCircle2 } from "lucide-react";

interface RecordingControlsProps {
  status: "idle" | "preparing" | "recording" | "paused" | "processing" | "completed";
  onStart: () => Promise<void>;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSubmit: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  onSubmit
}) => {
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
          Preparing...
        </Button>
      );
    case "recording":
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPause}>
            <Pause className="mr-2 h-4 w-4" /> Pause
          </Button>
          <Button variant="destructive" onClick={onStop}>
            <Square className="mr-2 h-4 w-4" /> Stop Recording
          </Button>
        </div>
      );
    case "paused":
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onResume}>
            <Play className="mr-2 h-4 w-4" /> Resume
          </Button>
          <Button variant="destructive" onClick={onStop}>
            <Square className="mr-2 h-4 w-4" /> Stop Recording
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
        <Button onClick={onSubmit} className="w-full">
          <CheckCircle2 className="mr-2 h-4 w-4" /> Submit Recording
        </Button>
      );
    default:
      return null;
  }
};

export default RecordingControls;
