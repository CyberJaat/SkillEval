
import React from "react";
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
import { Eye, PlayCircle } from "lucide-react";

// Mock data
const applications = [
  {
    id: "app1",
    job: "Frontend Developer",
    company: "TechCorp",
    applied: "2023-10-15",
    status: "completed",
    feedback: true,
  },
  {
    id: "app2",
    job: "UI/UX Designer",
    company: "CreativeStudio",
    applied: "2023-10-12",
    status: "pending",
    feedback: false,
  },
  {
    id: "app3",
    job: "Backend Engineer",
    company: "DataSystems",
    applied: "2023-10-10",
    status: "reviewing",
    feedback: false,
  },
  {
    id: "app4",
    job: "Full Stack Developer",
    company: "WebWorks",
    applied: "2023-10-05",
    status: "rejected",
    feedback: true,
  },
  {
    id: "app5",
    job: "Mobile Developer",
    company: "AppTech",
    applied: "2023-10-01",
    status: "accepted",
    feedback: true,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "secondary";
    case "pending":
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
                {application.feedback ? (
                  <span className="text-foreground">Available</span>
                ) : (
                  <span className="text-muted-foreground">Pending</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/jobs/${application.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Job Details
                    </Link>
                  </Button>
                  {application.status !== "pending" && (
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
