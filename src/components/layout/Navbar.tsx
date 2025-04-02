
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  const getInitials = () => {
    if (!profile) return "U";
    return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`;
  };

  const NavLinks = () => (
    <>
      <Link to="/jobs" className="text-foreground/80 hover:text-foreground transition-colors">
        Browse Jobs
      </Link>
      <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">
        How It Works
      </Link>
      {user && profile?.user_type === "recruiter" && (
        <Link to="/recruiter/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">
          Dashboard
        </Link>
      )}
      {user && profile?.user_type === "student" && (
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
          {user ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt={`${profile.first_name}'s avatar`} />
                      ) : (
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {profile ? `${profile.first_name || ''} ${profile.last_name || ''}` : user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(profile?.user_type === "recruiter" ? "/recruiter/dashboard" : "/student/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                {!user ? (
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
                ) : (
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
