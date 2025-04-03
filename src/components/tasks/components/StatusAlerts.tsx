
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface StatusAlertsProps {
  isFullScreen: boolean;
  warningShown: boolean;
  status: "idle" | "preparing" | "recording" | "paused" | "processing" | "completed";
}

const StatusAlerts: React.FC<StatusAlertsProps> = ({
  isFullScreen,
  warningShown,
  status
}) => {
  return (
    <>
      {isFullScreen && status === "recording" && (
        <Alert variant="default" className="bg-green-500/10 border-green-500/30">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Full Screen Detected</AlertTitle>
          <AlertDescription>
            You are sharing your entire screen. You may switch tabs while recording.
          </AlertDescription>
        </Alert>
      )}
      
      {warningShown && !isFullScreen && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Tab switching detected during recording. This may invalidate your submission.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default StatusAlerts;
