
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
import { ExternalLink, PlayCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data
const applicants = [
  {
    id: "app1",
    name: "John Smith",
    job: "Frontend Developer",
    submitted: "2023-10-18",
    status: "completed",
    score: 4.5,
    avatar: "",
  },
  {
    id: "app2",
    name: "Emily Johnson",
    job: "Frontend Developer",
    submitted: "2023-10-17",
    status: "reviewing",
    score: null,
    avatar: "",
  },
  {
    id: "app3",
    name: "Michael Brown",
    job: "Backend Engineer",
    submitted: "2023-10-16",
    status: "completed",
    score: 3.8,
    avatar: "",
  },
  {
    id: "app4",
    name: "Sophia Williams",
    job: "UI/UX Designer",
    submitted: "2023-10-15",
    status: "reviewing",
    score: null,
    avatar: "",
  },
  {
    id: "app5",
    name: "James Davis",
    job: "Backend Engineer",
    submitted: "2023-10-14",
    status: "completed",
    score: 4.2,
    avatar: "",
  },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "default";
    case "reviewing":
      return "secondary";
    default:
      return "outline";
  }
};

const ApplicantsTable = () => {
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
                <Button asChild size="sm" variant="outline">
                  <Link to={`/recruiter/applications/${applicant.id}`}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    View Recording
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

export default ApplicantsTable;
