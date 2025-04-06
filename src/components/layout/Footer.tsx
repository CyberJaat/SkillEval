
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background py-6">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/46c6d02b-b263-4ff5-af61-ea438e33b3f0.png" 
                alt="SkillEval Logo" 
                className="h-8 w-auto" 
              />
              <span className="text-xl font-bold text-gradient-gold">SkillEval</span>
            </Link>
            <p className="mt-2 text-sm text-foreground/70">
              Connecting talented students with recruiters through skill-based assessments.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jobs" className="text-foreground/70 hover:text-foreground transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-foreground/70 hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-foreground/70 hover:text-foreground transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-foreground/70 hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-foreground/70 hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border/40 text-center text-xs text-foreground/50">
          &copy; {new Date().getFullYear()} SkillEval. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
