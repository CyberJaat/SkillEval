
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"student" | "recruiter" | null>(null);

  // This would be connected to auth state in a real implementation
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
  };

  const NavLinks = () => (
    <>
      <Link to="/jobs" className="text-foreground/80 hover:text-foreground transition-colors">
        Browse Jobs
      </Link>
      <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">
        How It Works
      </Link>
      {isLoggedIn && userRole === "recruiter" && (
        <Link to="/recruiter/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">
          Dashboard
        </Link>
      )}
      {isLoggedIn && userRole === "student" && (
        <Link to="/student/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">
          Dashboard
        </Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient-gold">TaskBridge</span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex md:gap-6">
          <NavLinks />
        </div>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <div className="hidden md:flex md:gap-4">
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
          
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-6 mt-10">
                <NavLinks />
                {!isLoggedIn && (
                  <>
                    <SheetClose asChild>
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/login">Login</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full">
                        <Link to="/register">Register</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
                {isLoggedIn && (
                  <Button variant="outline" onClick={handleLogout} className="w-full">
                    Logout
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
