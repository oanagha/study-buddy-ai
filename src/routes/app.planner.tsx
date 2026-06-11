import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Clock, BookOpen, Sparkles, Check } from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/app/planner")({
  head: () => ({ meta: [{ title: "Study Planner — StudyMate AI" }] }),
  component: Planner,
});

const plan = [
  { day: "Day 1", topic: "Arrays & Strings", hours: 3, done: true },
  { day: "Day 2", topic: "Linked Lists", hours: 3, done: true },
  { day: "Day 3", topic: "Stacks & Queues", hours: 2.5, done: true },
  { day: "Day 4", topic: "Trees & Binary Search Trees", hours: 3, done: false },
  { day: "Day 5", topic: "Heaps & Priority Queues", hours: 2.5, done: false },
  { day: "Day 6", topic: "Hash Tables", hours: 2, done: false },
  { day: "Day 7", topic: "Graphs & Traversals", hours: 3.5, done: false },
  { day: "Day 8", topic: "Dynamic Programming", hours: 4, done: false },
  { day: "Day 9", topic: "Mock Test + Revision", hours: 3, done: false },
];

function Planner() {
  const [generated, setGenerated] = useState(true);
  const doneCount = plan.filter((p) => p.done).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="Study Planner" subtitle="AI-generated study schedules tailored to your exam." />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Setup */}
        <Card className="p-6 shadow-card border-border/50 h-fit">
          <h3 className="font-display font-semibold text-lg mb-4">Plan Settings</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="exam">Exam Date</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="exam" type="date" className="pl-9" defaultValue="2026-06-25" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="subject" className="pl-9" defaultValue="Data Structures & Algorithms" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hours">Daily Study Hours</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="hours" type="number" className="pl-9" defaultValue="3" min="1" max="12" />
              </div>
            </div>
            <Button
              className="w-full bg-gradient-primary shadow-glow"
              onClick={() => { setGenerated(true); toast.success("Plan regenerated!"); }}
            >
              <Sparkles className="h-4 w-4" /> Generate Study Plan
            </Button>
          </div>
        </Card>

        {/* Timeline */}
        <div className="space-y-4">
          {generated && (
            <Card className="p-5 shadow-card border-border/50 bg-gradient-soft">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Overall Progress</p>
                <p className="text-sm font-medium">{doneCount} of {plan.length} days</p>
              </div>
              <Progress value={(doneCount / plan.length) * 100} className="h-2.5" />
            </Card>
          )}

          <Card className="p-6 shadow-card border-border/50">
            <h3 className="font-display font-semibold text-lg mb-5">9-Day Study Plan</h3>
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-4">
                {plan.map((p) => (
                  <div key={p.day} className="relative pl-12">
                    <div className={`absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full border-2 ${
                      p.done ? "bg-accent border-accent text-accent-foreground" : "bg-card border-border"
                    }`}>
                      {p.done ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{p.day.split(" ")[1]}</span>}
                    </div>
                    <div className={`p-4 rounded-xl border transition ${p.done ? "bg-accent/5 border-accent/20" : "hover:border-primary/40"}`}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{p.topic}</p>
                            {p.done && <Badge variant="secondary" className="bg-accent/15 text-accent border-0 text-xs">Done</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{p.day} • {p.hours}h study time</p>
                        </div>
                        {!p.done && <Button size="sm" variant="outline">Start</Button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
