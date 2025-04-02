
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Briefcase, Users, Clock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import JobListingTable from "./JobListingTable";
import ApplicantsTable from "./ApplicantsTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [activeJobCount, setActiveJobCount] = useState(0);
  const [applicantsCount, setApplicantsCount] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch active jobs count
        const { count: jobCount, error: jobError } = await supabase
          .from("jobs")
          .select("*", { count: "exact" })
          .eq("recruiter_id", user.id)
          .eq("is_active", true);

        if (jobError) throw jobError;
        
        if (jobCount !== null) {
          setActiveJobCount(jobCount);
        }

        // Fetch all applications for recruiter's jobs
        const { data: recruitersJobs, error: jobsError } = await supabase
          .from("jobs")
          .select("id")
          .eq("recruiter_id", user.id);

        if (jobsError) throw jobsError;
        
        if (recruitersJobs && recruitersJobs.length > 0) {
          const jobIds = recruitersJobs.map(job => job.id);
          
          // Get total applicants count
          const { count: appCount, error: appError } = await supabase
            .from("applications")
            .select("*", { count: "exact" })
            .in("job_id", jobIds);

          if (appError) throw appError;
          
          if (appCount !== null) {
            setApplicantsCount(appCount);
          }
          
          // Get pending reviews count
          const { count: pendingCount, error: pendingError } = await supabase
            .from("applications")
            .select("*", { count: "exact" })
            .in("job_id", jobIds)
            .eq("status", "submitted");

          if (pendingError) throw pendingError;
          
          if (pendingCount !== null) {
            setPendingReviewsCount(pendingCount);
          }
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
        <Button asChild>
          <Link to="/recruiter/jobs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Post New Job
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Briefcase className="h-8 w-8 text-accent" />
              <span className="text-3xl font-bold">{activeJobCount}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-accent" />
              <span className="text-3xl font-bold">{applicantsCount}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Clock className="h-8 w-8 text-accent" />
              <span className="text-3xl font-bold">{pendingReviewsCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="jobs">My Job Listings</TabsTrigger>
          <TabsTrigger value="applicants">Recent Applicants</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs">
          <JobListingTable />
        </TabsContent>
        <TabsContent value="applicants">
          <ApplicantsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecruiterDashboard;
