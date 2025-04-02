
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Briefcase, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import JobListingTable from "./JobListingTable";
import ApplicantsTable from "./ApplicantsTable";

const RecruiterDashboard = () => {
  // In a real application, this would come from an API
  const activeJobCount = 5;
  const applicantsCount = 12;
  const pendingReviewsCount = 8;

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
