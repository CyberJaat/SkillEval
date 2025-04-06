
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
import { ExternalLink, PlayCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Applicant {
  id: string;
  name: string;
  job: string;
  jobId: string;
  submitted: string;
  status: string;
  score: number | null;
  avatar: string;
  hasRecording: boolean;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
};

const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "completed":
      return "default";
    case "submitted":
      return "secondary";
    case "reviewing":
      return "outline";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
};

const CustomApplicantsTable = () => {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // First get all job IDs for this recruiter
        const { data: jobs, error: jobsError } = await supabase
          .from("jobs")
          .select("id")
          .eq("recruiter_id", user.id);

        if (jobsError) throw jobsError;
        
        if (!jobs || jobs.length === 0) {
          setApplicants([]);
          setLoading(false);
          return;
        }

        const jobIds = jobs.map(job => job.id);
        
        // Fetch applications for these jobs with job and student details
        const { data: applications, error: applicationsError } = await supabase
          .from("applications")
          .select(`
            id, 
            status, 
            created_at,
            job_id,
            jobs(title),
            student_id,
            recording_url
          `)
          .in("job_id", jobIds)
          .order("created_at", { ascending: false })
          .limit(10);

        if (applicationsError) throw applicationsError;
        
        if (!applications || applications.length === 0) {
          setApplicants([]);
          setLoading(false);
          return;
        }

        // Get student profiles for each application
        const applicantsData = await Promise.all(
          applications.map(async (application) => {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("first_name, last_name, avatar_url")
              .eq("id", application.student_id)
              .single();

            if (profileError) {
              console.error("Error fetching profile:", profileError);
              return {
                id: application.id,
                name: "Unknown Student",
                job: application.jobs?.title || "Unknown Job",
                jobId: application.job_id,
                submitted: formatDate(application.created_at),
                status: application.status,
                score: null,
                avatar: "",
                hasRecording: !!application.recording_url
              };
            }

            // Check if there's an AI review
            let score = null;
            const { data: aiReview } = await supabase
              .from("ai_reviews")
              .select("score")
              .eq("application_id", application.id)
              .maybeSingle();

            if (aiReview) {
              score = aiReview.score;
            }

            return {
              id: application.id,
              name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown Student",
              job: application.jobs?.title || "Unknown Job",
              jobId: application.job_id,
              submitted: formatDate(application.created_at),
              status: application.status,
              score,
              avatar: profile.avatar_url || "",
              hasRecording: !!application.recording_url
            };
          })
        );

        setApplicants(applicantsData);
      } catch (error: any) {
        console.error("Error fetching applicants:", error);
        toast.error("Failed to load applicants data");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [user]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="rounded-md glass-panel p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground rounded-md glass-panel">
        <p className="mb-2">No applicants found.</p>
        <p className="text-sm">Your jobs will appear here once candidates apply.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md glass-panel">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Job</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>AI Score</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants.map((applicant) => (
            <TableRow key={applicant.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={applicant.avatar} alt={applicant.name} />
                    <AvatarFallback>{getInitials(applicant.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{applicant.name}</span>
                </div>
              </TableCell>
              <TableCell>{applicant.job}</TableCell>
              <TableCell>{applicant.submitted}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(applicant.status)}>
                  {applicant.status}
                </Badge>
              </TableCell>
              <TableCell>
                {applicant.score !== null ? (
                  <span className="font-medium">{applicant.score}/5.0</span>
                ) : (
                  <span className="text-muted-foreground">Pending</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant={applicant.hasRecording ? "default" : "outline"}>
                  <Link to={`/recruiter/applications/${applicant.id}`}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    View Application
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomApplicantsTable;
