
import React from "react";

interface RecordingPreviewProps {
  status: "idle" | "preparing" | "recording" | "paused" | "processing" | "completed";
  videoRef: React.RefObject<HTMLVideoElement>;
}

const RecordingPreview: React.FC<RecordingPreviewProps> = ({ status, videoRef }) => {
  return (
    <div className="aspect-video bg-black/20 rounded-md overflow-hidden relative">
      {status === "idle" ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <p>Start recording to see preview</p>
        </div>
      ) : (
        <video ref={videoRef} className="w-full h-full" autoPlay muted />
      )}
    </div>
  );
};

export default RecordingPreview;
