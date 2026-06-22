import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  Brain,
  Layers,
  MessageSquare,
  CalendarDays,
  TrendingUp,
  Upload,
  Cpu,
  Wand2,
  GraduationCap,
  ArrowRight,
  Check,
  Zap,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarketingNav, MarketingFooter } from "@/components/marketing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyMate AI — Study Smarter, Not Harder" },
      {
        name: "description",
        content:
          "AI-powered platform that turns your notes into summaries, quizzes, flashcards, and personalized study plans.",
      },
      { property: "og:title", content: "StudyMate AI" },
      { property: "og:description", content: "Transform Notes Into Knowledge With AI." },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: FileText,
    title: "AI Summary Generator",
    desc: "Get crisp short and detailed summaries from any document in seconds.",
  },
  {
    icon: Brain,
    title: "AI Quiz Generator",
    desc: "Auto-generate quizzes at Easy, Medium, or Hard difficulty from your notes.",
  },
  {
    icon: Layers,
    title: "Flashcard Creation",
    desc: "Beautiful, interactive flashcards that adapt to what you know.",
  },
  {
    icon: MessageSquare,
    title: "Ask Questions From Notes",
    desc: "Chat with your study material like ChatGPT — grounded in your content.",
  },
  {
    icon: CalendarDays,
    title: "Personalized Study Plans",
    desc: "Set an exam date and get a day-by-day plan tailored to your syllabus.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    desc: "Visualize streaks, mastery, and weekly activity in one dashboard.",
  },
];

const steps = [
  { icon: Upload, title: "Upload Notes", desc: "Drag and drop PDFs, DOCX, or text files." },
  {
    icon: Cpu,
    title: "AI Processes Content",
    desc: "Our models read, structure, and understand your material.",
  },
  {
    icon: Wand2,
    title: "Generate Materials",
    desc: "Summaries, quizzes, and flashcards in one click.",
  },
  { icon: GraduationCap, title: "Study Efficiently", desc: "Track progress and ace your exams." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft opacity-60" />
        <div className="absolute top-20 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 backdrop-blur px-3 py-1 text-xs font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered learning, built for students
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold font-display leading-[1.05] tracking-tight">
              Study <span className="text-gradient">Smarter</span>,<br />
              Not Harder
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Upload your study materials and let AI generate summaries, quizzes, flashcards, and
              personalized learning plans — all in one beautiful workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 shadow-glow h-12 px-6 text-base"
                >
                  Get Started <ArrowRight className="ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-4xl lg:text-5xl font-bold font-display">
            Everything you need to learn faster
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Six AI superpowers, one focused workspace.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-6 h-full shadow-card hover:shadow-glow/40 hover:-translate-y-1 transition-all border-border/50 group">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow mb-4 group-hover:scale-110 transition">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl lg:text-5xl font-bold font-display">How It Works</h2>
            <p className="mt-4 text-muted-foreground text-lg">From upload to A+ in four steps.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <Card className="p-6 h-full border-border/50 shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground text-sm font-bold">
                      {i + 1}
                    </span>
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neural Interface Showcase */}
      <section id="engine" className="relative overflow-hidden bg-slate-950 py-24 px-4 lg:px-8">
        <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase text-indigo-400">
                System Architecture v4.0
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-white leading-[1.05] tracking-tight">
              The Brain{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
                Behind the Grade.
              </span>
            </h2>

            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              StudyMate AI isn't just a helper — it's a cognitive engine. It deconstructs complex
              curricula into actionable intelligence, predictive analytics, and semantic summaries.
            </p>

            <div className="grid grid-cols-1 gap-4 pt-2">
              <div className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 grid h-12 w-12 place-items-center rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold font-display">
                      Neural Summarization
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Instant synthesis of 1,000+ page documents into core concepts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-fuchsia-500/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 grid h-12 w-12 place-items-center rounded-xl bg-fuchsia-500/20 text-fuchsia-400 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold font-display">
                      Predictive Exam Projection
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Identify likely test questions based on historical syllabus patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-7 relative"
          >
            <div className="relative bg-slate-900 rounded-3xl border border-white/10 shadow-[0_0_60px_-12px_rgba(79,70,229,0.4)] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <div className="px-4 py-1 rounded-md bg-white/5 text-[10px] text-slate-500 font-mono tracking-tighter">
                  ANALYTICS_MODULE_ACTIVE
                </div>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-12 gap-6">
                <div className="col-span-12 sm:col-span-8 space-y-6">
                  <div className="space-y-3">
                    <div className="h-2 w-24 bg-indigo-400/30 rounded-full" />
                    <div className="h-8 w-full bg-white/5 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-28 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex flex-col items-center justify-center gap-2">
                      <div className="text-2xl font-bold font-display text-indigo-400">98%</div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">
                        Accuracy
                      </div>
                    </div>
                    <div className="h-28 bg-fuchsia-500/5 border border-fuchsia-500/10 rounded-2xl flex flex-col items-center justify-center gap-2">
                      <div className="text-2xl font-bold font-display text-fuchsia-400">1.2s</div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">
                        Latency
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-32 bg-white/10 rounded" />
                      <div className="h-4 w-12 bg-emerald-500/20 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-white/5 rounded" />
                      <div className="h-2 w-5/6 bg-white/5 rounded" />
                      <div className="h-2 w-4/6 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>

                <div className="col-span-12 sm:col-span-4">
                  <div className="h-full w-full bg-gradient-to-b from-indigo-500/10 to-transparent border-l border-white/5 p-4 space-y-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 mx-auto grid place-items-center">
                      <Brain className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 w-full bg-white/10 rounded" />
                      <div className="h-1.5 w-full bg-white/10 rounded" />
                      <div className="h-1.5 w-3/4 bg-white/10 rounded" />
                    </div>
                    <div className="pt-2">
                      <div className="aspect-square rounded-xl bg-slate-800 border border-white/5 grid place-items-center">
                        <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin [animation-duration:2s]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-6 -right-2 sm:-right-6 bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-5 rounded-2xl shadow-2xl shadow-indigo-500/30 ring-1 ring-white/10"
            >
              <div className="text-[10px] uppercase tracking-widest opacity-80 mb-1">
                Processing Power
              </div>
              <div className="text-2xl font-bold font-display tracking-tight">4.2 TFLOPS</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-primary p-12 lg:p-16 text-center shadow-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)]" />
          <div className="relative">
            <h2 className="text-3xl lg:text-5xl font-bold font-display text-primary-foreground">
              Ready to transform your study sessions?
            </h2>
            <p className="mt-4 text-primary-foreground/80 text-lg">
              Join thousands of students learning smarter with AI.
            </p>
            <Link to="/register" className="inline-block mt-8">
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 h-12 px-8 text-base"
              >
                Start Learning Free <ArrowRight className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative aspect-square max-w-lg mx-auto">
      <div className="absolute inset-0 bg-gradient-primary rounded-3xl rotate-6 opacity-20 blur-2xl" />
      <Card className="relative p-6 shadow-glow border-border/50 backdrop-blur">
        <div className="flex items-center gap-2 pb-4 border-b">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">AI Summary</p>
            <p className="text-xs text-muted-foreground">Data Structures - Trees.pdf</p>
          </div>
        </div>
        <div className="space-y-3 py-4">
          {[
            "A tree is a hierarchical data structure...",
            "Binary trees have at most two children...",
            "BSTs allow O(log n) search...",
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
              className="flex gap-2 text-sm"
            >
              <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <span>{t}</span>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
          {[
            { label: "Cards", v: 24 },
            { label: "Score", v: "92%" },
            { label: "Streak", v: "12d" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-muted/50 p-2 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-bold font-display text-sm">{s.v}</p>
            </div>
          ))}
        </div>
      </Card>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-4 -right-4 rounded-2xl bg-card shadow-glow p-3 border"
      >
        <Brain className="h-6 w-6 text-primary" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute -bottom-4 -left-4 rounded-2xl bg-card shadow-glow p-3 border"
      >
        <Layers className="h-6 w-6 text-secondary" />
      </motion.div>
    </div>
  );
}
