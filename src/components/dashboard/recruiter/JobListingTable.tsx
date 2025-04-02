
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit, MoreVertical, Trash2, Eye } from "lucide-react";

// Mock data
const jobListings = [
  {
    id: "job1",
    title: "Frontend Developer",
    applicants: 5,
    status: "active",
    posted: "2023-10-15",
    deadline: "2023-11-15",
  },
  {
    id: "job2",
    title: "Backend Engineer",
    applicants: 3,
    status: "active",
    posted: "2023-10-10",
    deadline: "2023-11-10",
  },
  {
    id: "job3",
    title: "UI/UX Designer",
    applicants: 4,
    status: "active",
    posted: "2023-10-05",
    deadline: "2023-11-05",
  },
  {
    id: "job4",
    title: "Data Scientist",
    applicants: 0,
    status: "active",
    posted: "2023-10-01",
    deadline: "2023-11-01",
  },
  {
    id: "job5",
    title: "DevOps Engineer",
    applicants: 0,
    status: "draft",
    posted: "N/A",
    deadline: "N/A",
  },
];

const JobListingTable = () => {
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
                    <DropdownMenuItem className="text-destructive">
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
