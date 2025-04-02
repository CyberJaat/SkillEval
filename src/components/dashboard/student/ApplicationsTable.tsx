
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye, PlayCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Application {
  id: string;
  job: string;
  company: string;
  applied: string;
  status: string;
  job_id: string;
  hasFeedback: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "secondary";
    case "submitted":
      return "outline";
    case "reviewing":
      return "default";
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
};

const ApplicationsTable = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch student's applications with job details
        const { data, error } = await supabase
          .from("applications")
          .select(`
            id, 
            status, 
            created_at,
            job_id,
            jobs(title, company)
          `)
          .eq("student_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        if (!data || data.length === 0) {
          setApplications([]);
          return;
        }

        // Check for feedback for each application
        const applicationsWithFeedback = await Promise.all(
          data.map(async (app) => {
            const { data: feedback, error: feedbackError } = await supabase
              .from("recruiter_feedback")
              .select("id")
              .eq("application_id", app.id)
              .maybeSingle();

            if (feedbackError) {
              console.error("Error checking feedback:", feedbackError);
            }

            return {
              id: app.id,
              job: app.jobs?.title || "Unknown Job",
              company: app.jobs?.company || "Unknown Company",
              applied: formatDate(app.created_at),
              status: app.status,
              job_id: app.job_id,
              hasFeedback: !!feedback,
            };
          })
        );

        setApplications(applicationsWithFeedback);
      } catch (error: any) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No applications found. Browse jobs to apply!
      </div>
    );
  }

  return (
    <div className="rounded-md glass-panel">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell className="font-medium">{application.job}</TableCell>
              <TableCell>{application.company}</TableCell>
              <TableCell>{application.applied}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(application.status)}>
                  {application.status}
                </Badge>
              </TableCell>
              <TableCell>
                {application.hasFeedback ? (
                  <span className="text-foreground">Available</span>
                ) : (
                  <span className="text-muted-foreground">Pending</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/jobs/${application.job_id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Job Details
                    </Link>
                  </Button>
                  {application.status !== "submitted" && (
                    <Button asChild size="sm">
                      <Link to={`/student/applications/${application.id}`}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        View Recording
                      </Link>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicationsTable;
