
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, CheckCircle, Clock, Loader2 } from "lucide-react";
import ApplicationsTable from "./ApplicationsTable";
import RecommendedJobs from "./RecommendedJobs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [completedApplications, setCompletedApplications] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [availableJobsCount, setAvailableJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch completed applications count
        const { count: completedCount, error: completedError } = await supabase
          .from("applications")
          .select("*", { count: "exact" })
          .eq("student_id", user.id)
          .eq("status", "completed");

        if (completedError) throw completedError;
        
        if (completedCount !== null) {
          setCompletedApplications(completedCount);
        }

        // Fetch pending applications count
        const { count: pendingCount, error: pendingError } = await supabase
          .from("applications")
          .select("*", { count: "exact" })
          .eq("student_id", user.id)
          .eq("status", "submitted");

        if (pendingError) throw pendingError;
        
        if (pendingCount !== null) {
          setPendingReviews(pendingCount);
        }

        // Fetch available jobs count
        const { count: jobsCount, error: jobsError } = await supabase
          .from("jobs")
          .select("*", { count: "exact" })
          .eq("is_active", true);

        if (jobsError) throw jobsError;
        
        if (jobsCount !== null) {
          setAvailableJobsCount(jobsCount);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <Button asChild>
          <Link to="/jobs">
            <Briefcase className="mr-2 h-4 w-4" />
            Browse Jobs
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <CheckCircle className="h-8 w-8 text-accent" />
              <span className="text-3xl font-bold">{completedApplications}</span>
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
              <span className="text-3xl font-bold">{pendingReviews}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Available Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Briefcase className="h-8 w-8 text-accent" />
              <span className="text-3xl font-bold">{availableJobsCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="recommended">Recommended Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          <ApplicationsTable />
        </TabsContent>
        <TabsContent value="recommended">
          <RecommendedJobs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
