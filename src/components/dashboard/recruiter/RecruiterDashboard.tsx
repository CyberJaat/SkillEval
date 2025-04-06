
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CustomApplicantsTable from "./CustomApplicantsTable";
import JobListingTable from "./JobListingTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const RecruiterDashboard = () => {
  const [activeTab, setActiveTab] = useState("applications");
  
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['recruiter-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get count of active jobs
      const { count: jobCount, error: jobError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('recruiter_id', user.id)
        .eq('is_active', true);
        
      if (jobError) throw jobError;
      
      // Get count of applications
      const { count: applicationCount, error: appError } = await supabase
        .from('applications')
        .select('applications.id', { count: 'exact', head: true })
        .eq('jobs.recruiter_id', user.id)
        .join('jobs', { 'applications.job_id': 'jobs.id' });
        
      if (appError) throw appError;
      
      // Get count of applications with AI reviews
      const { count: reviewCount, error: reviewError } = await supabase
        .from('applications')
        .select('applications.id, ai_reviews!inner(id)', { count: 'exact', head: true })
        .eq('jobs.recruiter_id', user.id)
        .join('jobs', { 'applications.job_id': 'jobs.id' })
        .join('ai_reviews', { 'applications.id': 'ai_reviews.application_id' });
        
      if (reviewError) throw reviewError;
      
      return {
        activeJobs: jobCount || 0,
        totalApplications: applicationCount || 0,
        reviewedApplications: reviewCount || 0
      };
    },
    refetchOnWindowFocus: false
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Reviewed Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats?.reviewedApplications || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="jobs">Job Listings</TabsTrigger>
        </TabsList>
        <TabsContent value="applications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
          </div>
          <CustomApplicantsTable />
        </TabsContent>
        <TabsContent value="jobs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Job Listings</h2>
          </div>
          <JobListingTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecruiterDashboard;
