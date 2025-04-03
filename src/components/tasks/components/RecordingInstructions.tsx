
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface TaskDetails {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  timeLimit?: number;
}

interface RecordingInstructionsProps {
  task: TaskDetails;
}

const RecordingInstructions: React.FC<RecordingInstructionsProps> = ({ task }) => {
  return (
    <ScrollArea className="h-64">
      <div className="space-y-4">
        <p className="text-sm">{task.description}</p>
        <div className="space-y-2">
          <h4 className="font-medium">Steps to follow:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {task.instructions.map((instruction, index) => (
              <li key={index} className="text-sm">{instruction}</li>
            ))}
          </ul>
        </div>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Recording Tips</AlertTitle>
          <AlertDescription>
            For best results, share your entire screen when prompted. This will allow you to switch tabs during the recording.
          </AlertDescription>
        </Alert>
      </div>
    </ScrollArea>
  );
};

export default RecordingInstructions;
