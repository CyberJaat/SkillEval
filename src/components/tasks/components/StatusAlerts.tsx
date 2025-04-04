
import React from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface StatusAlertsProps {
  isFullScreen: boolean;
  warningShown: boolean;
  status: "idle" | "preparing" | "recording" | "paused" | "processing" | "completed";
  recordingError?: string | null;
}

const StatusAlerts: React.FC<StatusAlertsProps> = ({ 
  isFullScreen, 
  warningShown, 
  status,
  recordingError
}) => {
  // Show screen sharing error if available
  if (recordingError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Recording Error</AlertTitle>
        <AlertDescription>{recordingError}</AlertDescription>
      </Alert>
    );
  }
  
  // Show tab switching warning
  if (warningShown && !isFullScreen) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Tab switching detected</AlertTitle>
        <AlertDescription>
          You switched away from this tab during the recording. This may affect the validity of your submission.
        </AlertDescription>
      </Alert>
    );
  }

  // Show alert when recording is processing
  if (status === "processing") {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Processing Recording</AlertTitle>
        <AlertDescription>
          Please wait while we process your recording. This may take a moment.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default StatusAlerts;
