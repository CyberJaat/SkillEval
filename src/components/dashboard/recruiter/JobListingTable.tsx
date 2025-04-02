
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit, MoreVertical, Trash2, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface JobListing {
  id: string;
  title: string;
  applicants: number;
  status: string;
  posted: string;
  deadline: string;
}

const JobListingTable = () => {
  const { user } = useAuth();
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch recruiter's jobs
        const { data: jobs, error: jobsError } = await supabase
          .from("jobs")
          .select("*")
          .eq("recruiter_id", user.id)
          .order("created_at", { ascending: false });

        if (jobsError) throw jobsError;

        if (jobs) {
          // For each job, get the applicant count
          const jobsWithApplicants = await Promise.all(
            jobs.map(async (job) => {
              const { count, error: countError } = await supabase
                .from("applications")
                .select("*", { count: "exact" })
                .eq("job_id", job.id);

              if (countError) {
                console.error("Error fetching applicant count:", countError);
                return {
                  id: job.id,
                  title: job.title,
                  applicants: 0,
                  status: job.is_active ? "active" : "draft",
                  posted: formatDate(job.created_at),
                  deadline: formatDate(job.deadline),
                };
              }

              return {
                id: job.id,
                title: job.title,
                applicants: count || 0,
                status: job.is_active ? "active" : "draft",
                posted: formatDate(job.created_at),
                deadline: formatDate(job.deadline),
              };
            })
          );

          setJobListings(jobsWithApplicants);
        }
      } catch (error: any) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load job listings");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ is_active: false })
        .eq("id", jobId);

      if (error) throw error;

      // Update the job listings
      setJobListings(
        jobListings.map((job) =>
          job.id === jobId ? { ...job, status: "draft" } : job
        )
      );

      toast.success("Job marked as inactive");
    } catch (error: any) {
      toast.error("Failed to delete job");
      console.error("Error deleting job:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (jobListings.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No job listings found. Create your first job post!
      </div>
    );
  }

  return (
    <div className="rounded-md glass-panel">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applicants</TableHead>
            <TableHead>Posted</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobListings.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>
                <Badge variant={job.status === "active" ? "default" : "outline"}>
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell>{job.applicants}</TableCell>
              <TableCell>{job.posted}</TableCell>
              <TableCell>{job.deadline}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/jobs/${job.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/recruiter/jobs/${job.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobListingTable;
