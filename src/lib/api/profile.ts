import { API_URL } from "./config";
import { getAuthToken, clearAuthUser, isTokenExpired } from "@/lib/auth";
import { authFetch } from "./client";
import { ApiError } from "./auth";

export type ProfileStats = {
  notes_uploaded: number;
  avg_quiz_score: number;
  study_streak: number;
};

export type UserProfile = {
  id: number;
  full_name: string;
  email: string;
  education: string | null;
  course: string | null;
  bio: string | null;
  profile_image: string | null;
  stats: ProfileStats;
};

export type UpdateProfilePayload = {
  full_name: string;
  education?: string;
  course?: string;
  bio?: string;
  profile_image?: File | null;
};

export type UpdateProfileResponse = {
  message: string;
  profile: Pick<UserProfile, "full_name" | "education" | "course" | "bio" | "profile_image">;
};

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateProfileImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Profile image must be JPG, JPEG, PNG, or WEBP";
  }
  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    return "Image size exceeds 5 MB limit";
  }
  return null;
}

export async function fetchProfile(): Promise<UserProfile> {
  const data = await authFetch("/api/auth/profile");
  return data as UserProfile;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  if (isTokenExpired(token)) {
    clearAuthUser();
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  let body: BodyInit;

  if (payload.profile_image) {
    const formData = new FormData();
    formData.append("full_name", payload.full_name.trim());
    formData.append("education", payload.education?.trim() ?? "");
    formData.append("course", payload.course?.trim() ?? "");
    formData.append("bio", payload.bio?.trim() ?? "");
    formData.append("profile_image", payload.profile_image);
    body = formData;
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({
      full_name: payload.full_name.trim(),
      education: payload.education?.trim() || undefined,
      course: payload.course?.trim() || undefined,
      bio: payload.bio?.trim() || undefined,
    });
  }

  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: "PUT",
    headers,
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthUser();
    }

    throw new ApiError(response.status, data.message ?? "Failed to update profile", data.errors);
  }

  return data as UpdateProfileResponse;
}

export function getProfileInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
