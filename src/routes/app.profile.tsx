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
    <div className="max-w-7xl mx-auto space-y-6">
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

      <Card className="overflow-hidden shadow-card border-border/50">
        <div className="h-32 bg-gradient-primary relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent)]" />
        </div>
        <div className="p-6 -mt-12 relative">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar
                  key={avatarSrc ?? `initials-${initials}`}
                  className="h-24 w-24 ring-4 ring-background"
                >
                  {avatarSrc ? (
                    <AvatarImage src={avatarSrc} alt={displayName} className="object-cover" />
                  ) : null}
                  <AvatarFallback
                    delayMs={0}
                    className="bg-gradient-primary text-primary-foreground text-2xl font-bold"
                  >
                    {initials || "U"}
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <div className="absolute -bottom-1 -right-1 flex gap-1">
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-full bg-card shadow-card border"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Change profile photo"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    {avatarSrc && (
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-full bg-card shadow-card border text-destructive hover:bg-destructive/10"
                        onClick={handleRemoveImage}
                        aria-label="Remove profile photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h2 className="font-display text-2xl font-bold">{displayName}</h2>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
                    Change Password
                  </Button>
                  <Button onClick={startEditing} className="bg-gradient-primary">
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={cancelEditing} disabled={saving}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="bg-gradient-primary shadow-glow"
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
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <StatBlock
          icon={<BookOpen className="h-4 w-4" />}
          label="Notes"
          value={String(profile.stats.notes_uploaded)}
        />
        <StatBlock
          icon={<Award className="h-4 w-4" />}
          label="Avg Quiz Score"
          value={`${profile.stats.avg_quiz_score}%`}
        />
        <StatBlock
          icon={<GraduationCap className="h-4 w-4" />}
          label="Streak"
          value={profile.stats.study_streak === 1 ? "1 day" : `${profile.stats.study_streak} days`}
        />
      </div>

      <Card className="p-6 shadow-card border-border/50">
        <h3 className="font-display font-semibold text-lg mb-6">Personal Info</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Full Name"
            icon={<GraduationCap className="h-4 w-4" />}
            value={editing ? form.full_name : profile.full_name}
            editing={editing}
            onChange={(value) => setForm((current) => ({ ...current, full_name: value }))}
          />
          <Field
            label="Email"
            icon={<Mail className="h-4 w-4" />}
            value={profile.email}
            editing={false}
          />
          <Field
            label="Education"
            icon={<GraduationCap className="h-4 w-4" />}
            value={editing ? form.education : (profile.education ?? "")}
            editing={editing}
            onChange={(value) => setForm((current) => ({ ...current, education: value }))}
          />
          <Field
            label="Course"
            icon={<BookOpen className="h-4 w-4" />}
            value={editing ? form.course : (profile.course ?? "")}
            editing={editing}
            onChange={(value) => setForm((current) => ({ ...current, course: value }))}
          />
        </div>
        <div className="mt-5 space-y-1.5">
          <Label>Bio</Label>
          {editing ? (
            <Textarea
              value={form.bio}
              onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))}
              rows={3}
              maxLength={500}
            />
          ) : (
            <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/40">
              {profile.bio || "No bio added yet."}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-5 shadow-card border-border/50">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-bold font-display text-lg">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function Field({
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
      <Label>{label}</Label>
      {editing && onChange ? (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="pl-9" />
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 text-sm">
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-medium">{value || "—"}</span>
        </div>
      )}
    </div>
  );
}
