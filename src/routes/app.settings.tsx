import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Moon, Bell, Globe, Shield, User, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { PinInput } from "@/components/pin-input";
import { PasswordInput } from "@/components/password-input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/lib/theme";
import {
  downloadExportedData,
  disableTwoFactor,
  fetchSettings,
  LANGUAGE_OPTIONS,
  requestDataExport,
  setupTwoFactor,
  updateSettings,
  type UserSettings,
} from "@/lib/api/settings";
import { ApiError } from "@/lib/api/auth";
import { toast } from "sonner";
import type { ReactNode } from "react";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — StudyMate AI" }] }),
  component: Settings,
});

function Settings() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [updating2fa, setUpdating2fa] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [pinForm, setPinForm] = useState({ pin: "", confirm_pin: "", password: "" });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSettings();
      setSettings(data);
      setTheme(data.dark_mode ? "dark" : "light");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to load settings.");
      }
    } finally {
      setLoading(false);
    }
  }, [setTheme]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const persistSettings = async (next: UserSettings) => {
    setSaving(true);
    try {
      const result = await updateSettings({
        dark_mode: next.dark_mode,
        email_reminders: next.email_reminders,
        push_notifications: next.push_notifications,
        weekly_digest: next.weekly_digest,
        language: next.language,
      });
      setSettings(next);
      toast.success(result.message);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update settings.");
      }
      await loadSettings();
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    void persistSettings(next);
  };

  const handleDarkModeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    updateField("dark_mode", checked);
  };

  const resetPinForm = () => {
    setPinForm({ pin: "", confirm_pin: "", password: "" });
  };

  const handleSetupTwoFactor = async () => {
    if (!settings) return;

    if (pinForm.pin !== pinForm.confirm_pin) {
      toast.error("PINs do not match.");
      return;
    }

    setUpdating2fa(true);
    try {
      const result = await setupTwoFactor({
        pin: pinForm.pin,
        confirm_pin: pinForm.confirm_pin,
      });
      setSettings((current) => (current ? { ...current, two_factor_enabled: result.enabled } : current));
      setSetupDialogOpen(false);
      resetPinForm();
      toast.success(result.message);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors?.length) {
          toast.error(err.errors.map((e) => e.message).join(" "));
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Failed to enable two-factor authentication.");
      }
    } finally {
      setUpdating2fa(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!settings) return;

    setUpdating2fa(true);
    try {
      const result = await disableTwoFactor({
        pin: pinForm.pin,
        password: settings.has_password ? pinForm.password : undefined,
      });
      setSettings((current) => (current ? { ...current, two_factor_enabled: result.enabled } : current));
      setDisableDialogOpen(false);
      resetPinForm();
      toast.success(result.message);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors?.length) {
          toast.error(err.errors.map((e) => e.message).join(" "));
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Failed to disable two-factor authentication.");
      }
    } finally {
      setUpdating2fa(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { download_url: downloadUrl } = await requestDataExport();
      await downloadExportedData(downloadUrl);
      toast.success("Download started!");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to export data.");
      }
    } finally {
      setExporting(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Settings"
        subtitle={saving ? "Saving changes..." : "Customize StudyMate the way you study."}
      />

      <Dialog
        open={setupDialogOpen}
        onOpenChange={(open) => {
          setSetupDialogOpen(open);
          if (!open) resetPinForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable two-factor authentication</DialogTitle>
            <DialogDescription>
              Choose a 4–6 digit PIN. You will need it each time you sign in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="setup_pin">Security PIN</Label>
              <PinInput
                id="setup_pin"
                value={pinForm.pin}
                onChange={(pin) => setPinForm((current) => ({ ...current, pin }))}
                disabled={updating2fa}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="setup_confirm_pin">Confirm PIN</Label>
              <PinInput
                id="setup_confirm_pin"
                value={pinForm.confirm_pin}
                onChange={(confirm_pin) => setPinForm((current) => ({ ...current, confirm_pin }))}
                disabled={updating2fa}
                autoComplete="new-password"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Avoid easy PINs like 1234 or 1111.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupDialogOpen(false)} disabled={updating2fa}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-primary"
              disabled={updating2fa || pinForm.pin.length < 4 || pinForm.confirm_pin.length < 4}
              onClick={() => void handleSetupTwoFactor()}
            >
              {updating2fa ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enabling...
                </>
              ) : (
                "Enable 2FA"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={disableDialogOpen}
        onOpenChange={(open) => {
          setDisableDialogOpen(open);
          if (!open) resetPinForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable two-factor authentication</DialogTitle>
            <DialogDescription>
              Enter your PIN{settings.has_password ? " and password" : ""} to turn off two-factor authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="disable_pin">Security PIN</Label>
              <PinInput
                id="disable_pin"
                value={pinForm.pin}
                onChange={(pin) => setPinForm((current) => ({ ...current, pin }))}
                disabled={updating2fa}
                autoComplete="off"
              />
            </div>
            {settings.has_password ? (
              <div className="space-y-1.5">
                <Label htmlFor="disable_password">Password</Label>
                <PasswordInput
                  id="disable_password"
                  autoComplete="off"
                  value={pinForm.password}
                  onChange={(e) =>
                    setPinForm((current) => ({ ...current, password: e.target.value }))
                  }
                  disabled={updating2fa}
                />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableDialogOpen(false)} disabled={updating2fa}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={updating2fa || pinForm.pin.length < 4}
              onClick={() => void handleDisableTwoFactor()}
            >
              {updating2fa ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                "Disable 2FA"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Section icon={<Moon className="h-4 w-4" />} title="Appearance" desc="Switch between light and dark themes.">
        <Row label="Dark Mode" desc="Easier on the eyes in low light.">
          <Switch checked={theme === "dark"} onCheckedChange={handleDarkModeChange} disabled={saving} />
        </Row>
      </Section>

      <Section icon={<Bell className="h-4 w-4" />} title="Notifications" desc="Control what arrives in your inbox.">
        <Row label="Email reminders" desc="Daily study session reminders.">
          <Switch
            checked={settings.email_reminders}
            onCheckedChange={(checked) => updateField("email_reminders", checked)}
            disabled={saving}
          />
        </Row>
        <Row label="Push notifications" desc="Mobile and browser alerts.">
          <Switch
            checked={settings.push_notifications}
            onCheckedChange={(checked) => updateField("push_notifications", checked)}
            disabled={saving}
          />
        </Row>
        <Row label="Weekly digest" desc="Your progress summary every Sunday.">
          <Switch
            checked={settings.weekly_digest}
            onCheckedChange={(checked) => updateField("weekly_digest", checked)}
            disabled={saving}
          />
        </Row>
      </Section>

      <Section icon={<Globe className="h-4 w-4" />} title="Language & Region" desc="Choose your preferred language.">
        <Row label="Language" desc="Interface language.">
          <select
            className="rounded-lg border bg-card px-3 py-1.5 text-sm"
            value={settings.language}
            disabled={saving}
            onChange={(e) => updateField("language", e.target.value)}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Row>
      </Section>

      <Section icon={<User className="h-4 w-4" />} title="Account" desc="Manage your account preferences.">
        <Row label="Two-factor authentication" desc="Extra layer of security with a custom PIN.">
          <Button
            variant="outline"
            size="sm"
            disabled={updating2fa}
            onClick={() => {
              resetPinForm();
              if (settings.two_factor_enabled) {
                setDisableDialogOpen(true);
              } else {
                setSetupDialogOpen(true);
              }
            }}
          >
            {settings.two_factor_enabled ? "Disable" : "Enable"}
          </Button>
        </Row>
        <Row label="Download my data" desc="Get a copy of everything we have on file.">
          <Button variant="outline" size="sm" disabled={exporting} onClick={() => void handleExportData()}>
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing...
              </>
            ) : (
              "Download"
            )}
          </Button>
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
