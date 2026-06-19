import { Link } from "@tanstack/react-router";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">
            StudyMate <span className="text-gradient">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">
            Features
          </a>
          <a href="#how" className="hover:text-foreground transition">
            How it works
          </a>
          <a href="#testimonials" className="hover:text-foreground transition">
            Students
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="hidden sm:inline-flex">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
              Get Started
            </Button>
          </Link>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t px-4 py-4 space-y-3 bg-background">
          <a href="#features" className="block text-sm font-medium" onClick={() => setOpen(false)}>
            Features
          </a>
          <a href="#how" className="block text-sm font-medium" onClick={() => setOpen(false)}>
            How it works
          </a>
          <a
            href="#testimonials"
            className="block text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            Students
          </a>
          <Link to="/login" className="block text-sm font-medium">
            Log in
          </Link>
        </div>
      )}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">StudyMate AI</span>
          </div>
          <p className="text-sm text-muted-foreground">Transform notes into knowledge with AI.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#features" className="hover:text-foreground">
                Features
              </a>
            </li>
            <li>
              <a href="#how" className="hover:text-foreground">
                How it works
              </a>
            </li>
            <li>
              <Link to="/register" className="hover:text-foreground">
                Get Started
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#" className="hover:text-foreground">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Resources</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#" className="hover:text-foreground">
                Study Tips
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Blog
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © 2026 StudyMate AI. Built for curious students.
      </div>
    </footer>
  );
}
