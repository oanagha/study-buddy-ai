import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Mail, GraduationCap, BookOpen, Award, Loader2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { LoadingState } from "@/components/loading-spinner";
import { PasswordInput } from "@/components/password-input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getProfileInitials,
  preloadProfileImage,
  updateProfile,
  validateProfileImage,
  type UserProfile,
} from "@/lib/api/profile";
import { emitProfileUpdate } from "@/lib/profile-sync";
import { useProfileQuery } from "@/lib/queries/hooks";
import { queryKeys } from "@/lib/queries/keys";
import { ApiError, changePassword } from "@/lib/api/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — StudyMate AI" }] }),
  component: Profile,
});

type ProfileForm = {
  full_name: string;
  education: string;
  course: string;
  bio: string;
};

function Profile() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profileData, isPending: loading, error, refetch } = useProfileQuery();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    education: "",
    course: "",
    bio: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (!profileData || editing) return;
    setProfile(profileData);
    setForm({
      full_name: profileData.full_name,
      education: profileData.education ?? "",
      course: profileData.course ?? "",
      bio: profileData.bio ?? "",
    });
  }, [profileData, editing]);

  useEffect(() => {
    if (error instanceof ApiError) {
      toast.error(error.message);
    } else if (error) {
      toast.error("Failed to load profile.");
    }
  }, [error]);

  const syncProfile = useCallback(
    (nextProfile: UserProfile) => {
      setProfile(nextProfile);
      queryClient.setQueryData(queryKeys.profile, nextProfile);
      emitProfileUpdate(nextProfile);
    },
    [queryClient],
  );

  const resetEditState = useCallback(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name,
      education: profile.education ?? "",
      course: profile.course ?? "",
      bio: profile.bio ?? "",
    });
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
  }, [profile]);

  const startEditing = () => {
    resetEditState();
    setEditing(true);
  };

  const cancelEditing = () => {
    resetEditState();
    setEditing(false);
  };

  const handleImageSelect = (file: File | null) => {
    if (!file) return;

    const validationError = validateProfileImage(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const refreshProfileSilently = useCallback(async () => {
    try {
      const result = await refetch();
      if (result.data) {
        syncProfile(result.data);
      }
    } catch {
      // Keep optimistic UI if background refresh fails.
    }
  }, [refetch, syncProfile]);

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    if (form.full_name.trim().length > 100) {
      toast.error("Full name must be at most 100 characters.");
      return;
    }

    if (form.bio.length > 500) {
      toast.error("Bio must be at most 500 characters.");
      return;
    }

    setSaving(true);

    try {
      const uploadedPreview = imagePreview;
      const hadUpload = Boolean(imageFile);
      const hadRemove = removeImage && !imageFile;

      const result = await updateProfile({
        full_name: form.full_name,
        education: form.education,
        course: form.course,
        bio: form.bio,
        profile_image: imageFile,
        remove_profile_image: hadRemove,
      });

      if (!profile) return;

      const updatedProfile: UserProfile = {
        ...profile,
        ...result.profile,
      };

      setEditing(false);
      setImageFile(null);
      setRemoveImage(false);

      if (hadRemove) {
        setImagePreview(null);
        updatedProfile.profile_image = null;
        syncProfile(updatedProfile);
        void refreshProfileSilently();
      } else if (hadUpload && result.profile.profile_image && uploadedPreview) {
        const instantProfile: UserProfile = {
          ...updatedProfile,
          profile_image: uploadedPreview,
        };
        syncProfile(instantProfile);

        const serverImage = result.profile.profile_image;
        void preloadProfileImage(serverImage)
          .then(() => {
            if (uploadedPreview.startsWith("blob:")) {
              URL.revokeObjectURL(uploadedPreview);
            }
            setImagePreview(null);
            const finalProfile = { ...updatedProfile, profile_image: serverImage };
            syncProfile(finalProfile);
            void refreshProfileSilently();
          })
          .catch(() => {
            setImagePreview(null);
            syncProfile(updatedProfile);
            void refreshProfileSilently();
          });
      } else {
        setImagePreview(null);
        syncProfile(updatedProfile);
        void refreshProfileSilently();
      }

      toast.success(result.message);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
  };

  const handleChangePassword = async () => {
    if (
      !passwordForm.current_password ||
      !passwordForm.new_password ||
      !passwordForm.confirm_password
    ) {
      toast.error("All password fields are required.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    if (passwordForm.current_password === passwordForm.new_password) {
      toast.error("New password cannot be same as current password.");
      return;
    }

    setChangingPassword(true);

    try {
      const result = await changePassword(passwordForm);
      toast.success(result.message);
      setPasswordDialogOpen(false);
      resetPasswordForm();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to change password.");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading profile" className="py-16 text-muted-foreground" />;
  }

  if (!profile) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Unable to load profile.</p>
        <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const displayName = editing ? form.full_name : profile.full_name;
  const displayCourse = editing ? form.course : profile.course;
  const displayEducation = editing ? form.education : profile.education;
  const subtitle =
    [displayCourse, displayEducation].filter(Boolean).join(" • ") || "StudyMate learner";
  const avatarSrc = removeImage ? undefined : (imagePreview ?? profile.profile_image ?? undefined);
  const initials = getProfileInitials(displayName);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="Profile" subtitle="Your StudyMate identity and learning info." />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleImageSelect(e.target.files?.[0] ?? null)}
      />

      <Dialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open);
          if (!open) resetPasswordForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new secure password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="current_password">Current Password</Label>
              <PasswordInput
                id="current_password"
                autoComplete="off"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm((current) => ({ ...current, current_password: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_password">New Password</Label>
              <PasswordInput
                id="new_password"
                autoComplete="off"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm((current) => ({ ...current, new_password: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <PasswordInput
                id="confirm_password"
                autoComplete="off"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm((current) => ({ ...current, confirm_password: e.target.value }))
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters and include uppercase, lowercase, and a number.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordDialogOpen(false)}
              disabled={changingPassword}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-primary"
              disabled={changingPassword}
              onClick={() => void handleChangePassword()}
            >
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-card border border-border/50 shadow-2xl">
        <div className="h-40 md:h-48 w-full bg-gradient-primary relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.5),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        </div>

        <div className="px-6 md:px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-16 gap-6 relative z-10">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary to-purple-400 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500" />
            <div className="relative">
              <Avatar
                key={avatarSrc ?? `initials-${initials}`}
                className="h-32 w-32 border-4 border-card shadow-xl"
              >
                {avatarSrc ? (
                  <AvatarImage src={avatarSrc} alt={displayName} className="object-cover" />
                ) : null}
                <AvatarFallback
                  delayMs={0}
                  className="bg-gradient-primary text-primary-foreground text-3xl font-bold"
                >
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              {editing && (
                <div className="absolute -bottom-1 -right-1 flex gap-1">
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Change profile photo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  {avatarSrc && (
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-full bg-card border text-destructive hover:bg-destructive/10 shadow-lg"
                      onClick={handleRemoveImage}
                      aria-label="Remove profile photo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-end w-full pb-2 gap-4">
            <div className="text-center md:text-left">
              <h2 className="font-display text-3xl font-bold tracking-tight">{displayName}</h2>
              <p className="text-primary/80 font-medium">{subtitle}</p>
            </div>

            <div className="flex gap-3">
              {!editing ? (
                <>
                  <Button
                    variant="outline"
                    className="rounded-xl border-primary/30 bg-primary/5 hover:bg-primary/10"
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Change Password
                  </Button>
                  <Button
                    onClick={startEditing}
                    className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card/60 backdrop-blur-xl rounded-[2rem] border border-border/50 p-6 md:p-8 h-full shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold">Personal Information</h3>
              </div>
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50">
                Profile Details
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <LuxField
                label="Full Name"
                icon={<GraduationCap className="h-4 w-4" />}
                value={editing ? form.full_name : profile.full_name}
                editing={editing}
                onChange={(value) => setForm((c) => ({ ...c, full_name: value }))}
              />
              <LuxField
                label="Email Address"
                icon={<Mail className="h-4 w-4" />}
                value={profile.email}
                editing={false}
              />
              <LuxField
                label="Education"
                icon={<GraduationCap className="h-4 w-4" />}
                value={editing ? form.education : (profile.education ?? "")}
                editing={editing}
                onChange={(value) => setForm((c) => ({ ...c, education: value }))}
              />
              <LuxField
                label="Course"
                icon={<BookOpen className="h-4 w-4" />}
                value={editing ? form.course : (profile.course ?? "")}
                editing={editing}
                onChange={(value) => setForm((c) => ({ ...c, course: value }))}
              />
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Bio
                </label>
                {editing ? (
                  <Textarea
                    value={form.bio}
                    onChange={(e) => setForm((c) => ({ ...c, bio: e.target.value }))}
                    rows={4}
                    maxLength={500}
                    className="rounded-xl bg-background/40 border-border/50"
                  />
                ) : (
                  <div className="w-full bg-background/40 border border-border/50 rounded-xl px-4 py-4 text-sm text-muted-foreground leading-relaxed min-h-[96px]">
                    {profile.bio || "No bio added yet."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <LuxStat
            label="Notes Uploaded"
            value={String(profile.stats.notes_uploaded)}
            accent="indigo"
            footer="Knowledge library"
            progress={Math.min(100, profile.stats.notes_uploaded * 5)}
          />
          <LuxStat
            label="Avg Quiz Score"
            value={`${profile.stats.avg_quiz_score}%`}
            accent="purple"
            footer={
              profile.stats.avg_quiz_score >= 80
                ? "Top performer"
                : profile.stats.avg_quiz_score >= 50
                  ? "Steady progress"
                  : "Keep practicing"
            }
            progress={profile.stats.avg_quiz_score}
          />
          <LuxStat
            label="Current Streak"
            value={String(profile.stats.study_streak)}
            suffix={profile.stats.study_streak === 1 ? "DAY" : "DAYS"}
            accent="orange"
            footer="Stay consistent"
            dots={Math.min(5, profile.stats.study_streak)}
          />
        </div>
      </div>
    </div>
  );
}

function LuxField({
  label,
  icon,
  value,
  editing,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  editing: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      {editing && onChange ? (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-9 rounded-xl bg-background/40 border-border/50"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full bg-background/40 border border-border/50 rounded-xl px-4 py-3 text-sm">
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-medium">{value || "—"}</span>
        </div>
      )}
    </div>
  );
}

function LuxStat({
  label,
  value,
  suffix,
  accent,
  footer,
  progress,
  dots,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent: "indigo" | "purple" | "orange";
  footer: string;
  progress?: number;
  dots?: number;
}) {
  const accentMap = {
    indigo: {
      hover: "hover:border-primary/50",
      bar: "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]",
      text: "text-primary",
      dot: "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]",
    },
    purple: {
      hover: "hover:border-purple-500/50",
      bar: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]",
      text: "text-purple-400",
      dot: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]",
    },
    orange: {
      hover: "hover:border-orange-500/50",
      bar: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]",
      text: "text-orange-400",
      dot: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]",
    },
  }[accent];

  return (
    <div
      className={`bg-card rounded-[2rem] border border-border/50 p-6 group transition-all shadow-lg overflow-hidden relative ${accentMap.hover}`}
    >
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="font-display text-4xl font-bold">{value}</p>
        {suffix && (
          <p className={`font-bold text-xs tracking-widest ${accentMap.text}`}>{suffix}</p>
        )}
      </div>

      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${accentMap.bar}`}
            style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
          />
        </div>
      )}

      {typeof dots === "number" && (
        <div className="mt-4 flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < dots ? accentMap.dot : "bg-muted"}`}
            />
          ))}
        </div>
      )}

      <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${accentMap.text}`}>
        {footer}
      </p>
    </div>
  );
}
