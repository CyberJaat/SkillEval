import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CloudCog, Shield, UserRound, CheckCircle2 } from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 hero-pattern">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none">
                <span className="text-gradient-gold">TaskBridge</span>
                <span className="block mt-1">Connecting Talent Through Task-Based Hiring</span>
              </h1>
              <p className="max-w-[800px] text-muted-foreground md:text-xl">
                Revolutionizing recruitment with authentic skill verification. 
                Complete real-world tasks, showcase your abilities, and connect with opportunities that matter.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-md">
                <Link to="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-md">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How TaskBridge Works</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                A transparent process that benefits both recruiters and students
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center space-y-4 p-6 glass-panel rounded-lg">
                <div className="p-3 rounded-full bg-primary/10 text-accent">
                  <BriefcaseBusiness size={36} />
                </div>
                <h3 className="text-xl font-bold">1. Task-Based Job Posting</h3>
                <p className="text-muted-foreground text-center">
                  Recruiters post jobs with specific tasks designed to showcase relevant skills.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 glass-panel rounded-lg">
                <div className="p-3 rounded-full bg-primary/10 text-accent">
                  <UserRound size={36} />
                </div>
                <h3 className="text-xl font-bold">2. Recorded Completion</h3>
                <p className="text-muted-foreground text-center">
                  Students record their screen as they complete the assigned task to verify their skills.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 glass-panel rounded-lg">
                <div className="p-3 rounded-full bg-primary/10 text-accent">
                  <CloudCog size={36} />
                </div>
                <h3 className="text-xl font-bold">3. AI-Powered Review</h3>
                <p className="text-muted-foreground text-center">
                  Advanced AI analyzes recordings to provide detailed feedback and performance scores.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Secure, Transparent, and Effective
              </h2>
              <p className="text-muted-foreground text-lg">
                Our platform ensures integrity in the recruitment process with built-in anti-cheating measures and transparent evaluations.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Anti-Cheating Protection</h3>
                    <p className="text-muted-foreground text-sm">
                      Monitor tab-switching and ensure continuous recording during task completion.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CloudCog className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Intelligent Analysis</h3>
                    <p className="text-muted-foreground text-sm">
                      AI-powered review of code, design, and presentation skills with specific feedback.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <BriefcaseBusiness className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Skill-Based Matching</h3>
                    <p className="text-muted-foreground text-sm">
                      Connect with opportunities that align with your proven abilities and interests.
                    </p>
                  </div>
                </li>
              </ul>
              <Button asChild>
                <Link to="/register">Join TaskBridge Today</Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-video glass-panel rounded-lg overflow-hidden border border-white/10 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="People collaborating" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 glass-panel rounded-lg p-4 border border-white/10 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">AI Review Complete</p>
                    <p className="text-muted-foreground">Score: 4.5/5.0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-accent text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Hiring Process?
              </h2>
              <p className="max-w-[700px] text-white/80 md:text-xl">
                Join TaskBridge today and start connecting with the right talent or opportunities.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="default" className="bg-white text-accent hover:bg-white/90">
                <Link to="/register">
                  Create an Account
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
