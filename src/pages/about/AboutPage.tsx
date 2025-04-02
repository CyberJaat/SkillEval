
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Award, 
  Briefcase, 
  CheckCircle2, 
  FileVideo, 
  GraduationCap, 
  Shield, 
  UserRound 
} from "lucide-react";

const AboutPage = () => {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About TaskBridge</h1>
          <p className="text-xl text-muted-foreground">
            Revolutionizing recruitment through task-based skill verification
          </p>
        </div>
        
        <div className="space-y-16">
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-lg text-foreground/90">
              TaskBridge was created to solve a fundamental problem in technical recruitment: the gap between claimed skills on resumes and actual abilities. We believe that the best way to evaluate talent is to see skills in action through relevant, real-world tasks.
            </p>
            <p className="text-lg text-foreground/90">
              Our platform connects students and recent graduates with employers through a transparent, skill-based process that benefits both sides of the hiring equation.
            </p>
          </section>
          
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">How TaskBridge Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-6 rounded-lg">
                <h3 className="text-xl font-bold flex items-center mb-4">
                  <Briefcase className="mr-2 h-5 w-5 text-accent" />
                  For Recruiters
                </h3>
                <ol className="space-y-4 pl-5 list-decimal">
                  <li className="pl-2">
                    <span className="font-medium">Post task-based job listings</span>
                    <p className="text-muted-foreground mt-1">
                      Create job listings with specific tasks designed to verify relevant skills.
                    </p>
                  </li>
                  <li className="pl-2">
                    <span className="font-medium">Review AI-analyzed submissions</span>
                    <p className="text-muted-foreground mt-1">
                      Our AI system evaluates recordings and provides detailed feedback on candidate performance.
                    </p>
                  </li>
                  <li className="pl-2">
                    <span className="font-medium">Make data-driven hiring decisions</span>
                    <p className="text-muted-foreground mt-1">
                      Use objective skill assessments to identify top candidates more effectively.
                    </p>
                  </li>
                </ol>
              </div>
              
              <div className="glass-panel p-6 rounded-lg">
                <h3 className="text-xl font-bold flex items-center mb-4">
                  <GraduationCap className="mr-2 h-5 w-5 text-accent" />
                  For Students
                </h3>
                <ol className="space-y-4 pl-5 list-decimal">
                  <li className="pl-2">
                    <span className="font-medium">Find relevant opportunities</span>
                    <p className="text-muted-foreground mt-1">
                      Browse job listings from companies seeking your specific skills.
                    </p>
                  </li>
                  <li className="pl-2">
                    <span className="font-medium">Demonstrate your abilities</span>
                    <p className="text-muted-foreground mt-1">
                      Complete tasks while recording your screen to showcase your real skills.
                    </p>
                  </li>
                  <li className="pl-2">
                    <span className="font-medium">Receive valuable feedback</span>
                    <p className="text-muted-foreground mt-1">
                      Get AI-generated reviews and recruiter feedback to help you improve.
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </section>
          
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileVideo className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Screen Recording</h3>
                <p className="text-muted-foreground">
                  Capture the entire task completion process for transparent skill verification.
                </p>
              </div>
              
              <div className="glass-panel p-6 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Anti-Cheating</h3>
                <p className="text-muted-foreground">
                  Built-in measures to ensure the integrity of task submissions.
                </p>
              </div>
              
              <div className="glass-panel p-6 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">AI-Powered Review</h3>
                <p className="text-muted-foreground">
                  Automated assessment of skills with detailed feedback and scoring.
                </p>
              </div>
              
              <div className="glass-panel p-6 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Skill Verification</h3>
                <p className="text-muted-foreground">
                  Concrete proof of abilities that goes beyond traditional resumes.
                </p>
              </div>
              
              <div className="glass-panel p-6 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <UserRound className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Comprehensive Profiles</h3>
                <p className="text-muted-foreground">
                  Showcase your portfolio, skills, and task history to potential employers.
                </p>
              </div>
              
              <div className="glass-panel p-6 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2">Tailored Job Matches</h3>
                <p className="text-muted-foreground">
                  Recommendations based on your proven skills and preferences.
                </p>
              </div>
            </div>
          </section>
          
          <section className="glass-panel p-8 rounded-lg">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Hiring or Job Search?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join TaskBridge today and experience the future of skill-based recruitment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/register">Create an Account</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
