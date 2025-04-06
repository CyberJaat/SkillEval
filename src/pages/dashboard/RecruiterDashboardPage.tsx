
import React from "react";
import RecruiterDashboard from "@/components/dashboard/recruiter/RecruiterDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RecruiterDashboardPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Recruiter Dashboard</h1>
      <RecruiterDashboard />
    </div>
  );
};

export default RecruiterDashboardPage;
