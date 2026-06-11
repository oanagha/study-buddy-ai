import { createFileRoute, Link } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Sign up — StudyMate AI" }] }),
  component: Register,
});

function Register() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 min-h-[640px]">
        {/* Left blue panel */}
        <div className="relative bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#1e40af] p-10 flex flex-col text-white overflow-hidden">
          <h2 className="font-display text-3xl font-light tracking-wide">Welcome to</h2>

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-lg mb-5">
              <Rocket className="h-12 w-12 text-[#2563eb]" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-wide">StudyMate</h1>
            <p className="mt-6 text-sm text-white/80 leading-relaxed max-w-xs">
              Join thousands of learners turning notes into mastery
              with AI-powered summaries, quizzes, and flashcards.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] text-white/70">
            <span>LEARN <span className="text-white font-semibold ml-1">SMARTER</span></span>
            <span className="h-3 w-px bg-white/40" />
            <span>STUDY <span className="text-white font-semibold ml-1">FASTER</span></span>
          </div>

          <svg
            className="absolute top-0 right-0 h-full w-16 text-white"
            viewBox="0 0 60 600"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M60,0 Q20,75 40,150 Q60,225 20,300 Q-10,375 40,450 Q60,525 30,600 L60,600 Z" opacity="0.15" />
            <path d="M60,0 Q30,75 50,150 Q70,225 30,300 Q0,375 50,450 Q70,525 40,600 L60,600 Z" opacity="0.25" />
            <path d="M60,0 Q40,75 55,150 Q75,225 40,300 Q15,375 55,450 Q75,525 50,600 L60,600 Z" />
          </svg>
        </div>

        {/* Right form panel */}
        <div className="p-10 sm:p-12 flex flex-col justify-center">
          <h2 className="font-display text-3xl text-center text-slate-800 font-normal mb-8">
            Create your account
          </h2>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/app/dashboard";
            }}
          >
            <Field label="Name" type="text" placeholder="Enter your name" />
            <Field label="E-mail Address" type="email" placeholder="Enter your mail" />
            <Field label="Password" type="password" placeholder="Enter your password" />

            <label className="flex items-center gap-2 text-xs text-slate-600 pt-1">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#2563eb]" />
              <span>
                By Signing Up, I agree with{" "}
                <a href="#" className="text-[#2563eb] hover:underline">Terms &amp; Conditions</a>
              </span>
            </label>

            <div className="flex items-center gap-4 pt-2">
              <Button
                type="submit"
                className="rounded-full px-8 h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-md"
              >
                Sign Up
              </Button>
              <Link
                to="/login"
                className="rounded-full px-8 h-11 inline-flex items-center justify-center border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <div>
      <label className="block text-sm text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        required
        className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-[#2563eb] focus:ring-0 outline-none py-2 text-sm text-slate-800 placeholder:text-slate-400"
      />
    </div>
  );
}
