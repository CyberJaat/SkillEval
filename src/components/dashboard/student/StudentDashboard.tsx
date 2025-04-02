
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, CheckCircle, Clock } from "lucide-react";
import ApplicationsTable from "./ApplicationsTable";
import RecommendedJobs from "./RecommendedJobs";

const StudentDashboard = () => {
  // In a real application, this would come from an API
  const completedApplications = 3;
  const pendingReviews = 2;
  const availableJobsCount = 15;

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
