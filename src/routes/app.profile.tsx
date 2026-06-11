import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Mail, GraduationCap, BookOpen, Award } from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — StudyMate AI" }] }),
  component: Profile,
});

function Profile() {
  const [editing, setEditing] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Profile" subtitle="Your StudyMate identity and learning info." />

      <Card className="overflow-hidden shadow-card border-border/50">
        <div className="h-32 bg-gradient-primary relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent)]" />
        </div>
        <div className="p-6 -mt-12 relative">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-background">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-bold">AV</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-card shadow-card border">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="pb-1">
                <h2 className="font-display text-2xl font-bold">Anagha Verma</h2>
                <p className="text-sm text-muted-foreground">Computer Science • IIT Delhi</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <Button variant="outline" onClick={() => toast.info("Password reset link sent.")}>Change Password</Button>
                  <Button onClick={() => setEditing(true)} className="bg-gradient-primary">Edit Profile</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button onClick={() => { setEditing(false); toast.success("Profile updated!"); }} className="bg-gradient-primary shadow-glow">Save Changes</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <StatBlock icon={<BookOpen className="h-4 w-4" />} label="Notes" value="24" />
        <StatBlock icon={<Award className="h-4 w-4" />} label="Avg Quiz Score" value="86%" />
        <StatBlock icon={<GraduationCap className="h-4 w-4" />} label="Streak" value="12 days" />
      </div>

      <Card className="p-6 shadow-card border-border/50">
        <h3 className="font-display font-semibold text-lg mb-6">Personal Info</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full Name" icon={<GraduationCap className="h-4 w-4" />} value="Anagha Verma" editing={editing} />
          <Field label="Email" icon={<Mail className="h-4 w-4" />} value="anagha.verma@iitd.ac.in" editing={editing} />
          <Field label="Education" icon={<GraduationCap className="h-4 w-4" />} value="B.Tech, 3rd Year" editing={editing} />
          <Field label="Course" icon={<BookOpen className="h-4 w-4" />} value="Computer Science" editing={editing} />
        </div>
        <div className="mt-5 space-y-1.5">
          <Label>Bio</Label>
          {editing ? (
            <Textarea defaultValue="Aspiring software engineer passionate about AI, algorithms, and building products students love." rows={3} />
          ) : (
            <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/40">
              Aspiring software engineer passionate about AI, algorithms, and building products students love.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-5 shadow-card border-border/50">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-bold font-display text-lg">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function Field({ label, icon, value, editing }: { label: string; icon: React.ReactNode; value: string; editing: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {editing ? (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
          <Input defaultValue={value} className="pl-9" />
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 text-sm">
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-medium">{value}</span>
        </div>
      )}
    </div>
  );
}
