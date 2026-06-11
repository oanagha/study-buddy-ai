import { createFileRoute } from "@tanstack/react-router";
import { Moon, Bell, Globe, Shield, User } from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — StudyMate AI" }] }),
  component: Settings,
});

function Settings() {
  const { theme, toggle } = useTheme();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [notifWeekly, setNotifWeekly] = useState(true);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Settings" subtitle="Customize StudyMate the way you study." />

      <Section icon={<Moon className="h-4 w-4" />} title="Appearance" desc="Switch between light and dark themes.">
        <Row label="Dark Mode" desc="Easier on the eyes in low light.">
          <Switch checked={theme === "dark"} onCheckedChange={toggle} />
        </Row>
      </Section>

      <Section icon={<Bell className="h-4 w-4" />} title="Notifications" desc="Control what arrives in your inbox.">
        <Row label="Email reminders" desc="Daily study session reminders.">
          <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
        </Row>
        <Row label="Push notifications" desc="Mobile and browser alerts.">
          <Switch checked={notifPush} onCheckedChange={setNotifPush} />
        </Row>
        <Row label="Weekly digest" desc="Your progress summary every Sunday.">
          <Switch checked={notifWeekly} onCheckedChange={setNotifWeekly} />
        </Row>
      </Section>

      <Section icon={<Globe className="h-4 w-4" />} title="Language & Region" desc="Choose your preferred language.">
        <Row label="Language" desc="Interface language.">
          <select className="rounded-lg border bg-card px-3 py-1.5 text-sm">
            <option>English (US)</option>
            <option>हिन्दी</option>
            <option>Español</option>
            <option>Français</option>
            <option>Deutsch</option>
          </select>
        </Row>
      </Section>

      <Section icon={<User className="h-4 w-4" />} title="Account" desc="Manage your account preferences.">
        <Row label="Two-factor authentication" desc="Extra layer of security.">
          <Button variant="outline" size="sm">Enable</Button>
        </Row>
        <Row label="Download my data" desc="Get a copy of everything we have on file.">
          <Button variant="outline" size="sm" onClick={() => toast.success("Download started!")}>Download</Button>
        </Row>
      </Section>

      <Section icon={<Shield className="h-4 w-4" />} title="Security" desc="Sign out or delete your account.">
        <Row label="Sign out on all devices" desc="Ends every active session.">
          <Button variant="outline" size="sm">Sign out all</Button>
        </Row>
        <Row label="Delete account" desc="This action is permanent.">
          <Button variant="destructive" size="sm">Delete</Button>
        </Row>
      </Section>
    </div>
  );
}

function Section({ icon, title, desc, children }: { icon: ReactNode; title: string; desc: string; children: ReactNode }) {
  return (
    <Card className="p-6 shadow-card border-border/50">
      <div className="flex items-start gap-3 mb-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
          {icon}
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="divide-y">{children}</div>
    </Card>
  );
}

function Row({ label, desc, children }: { label: string; desc: string; children: ReactNode }) {
  return (
    <div className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
