
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock, Briefcase, MapPin } from "lucide-react";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  posted: string;
  deadline: string;
  skills: string[];
  description: string;
  companyLogo?: string;
}

interface JobCardProps {
  job: JobListing;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg glass-panel">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
              {job.companyLogo ? (
                <img 
                  src={job.companyLogo} 
                  alt={`${job.company} logo`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Briefcase className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <span className="font-medium">{job.company}</span>
                <span className="mx-2">•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{job.location}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge variant={job.type === "Full-time" ? "default" : "outline"}>
            {job.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
          {job.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="font-normal">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t border-border/40 pt-3 mt-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Posted {job.posted}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Due {job.deadline}</span>
          </div>
        </div>
        <Button asChild size="sm">
          <Link to={`/jobs/${job.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
