
import React, { useEffect, useState } from "react";

interface RecordingTimerProps {
  status: "idle" | "preparing" | "recording" | "paused" | "processing" | "completed";
  formattedTime: string;
}

const RecordingTimer: React.FC<RecordingTimerProps> = ({ status, formattedTime }) => {
  const [time, setTime] = useState(formattedTime);
  
  // Ensure timer display updates even if the parent state doesn't update
  useEffect(() => {
    setTime(formattedTime);
  }, [formattedTime]);

  if (status === "idle" || status === "preparing") {
    return null;
  }

  return (
    <div className="flex justify-between items-center p-2 bg-muted/40 rounded-md">
      <div className="flex items-center">
        {status === "recording" && (
          <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse" />
        )}
        <span className="text-sm font-medium">
          {status === "recording" ? "Recording" : 
           status === "paused" ? "Paused" : 
           status === "completed" ? "Recording Complete" : 
           status === "processing" ? "Processing" : ""}
        </span>
      </div>
      <div className="text-sm font-mono">
        {time}
      </div>
    </div>
  );
};

export default RecordingTimer;
