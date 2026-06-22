import type { UserProfile } from "@/lib/api/profile";

type ProfileListener = (profile: UserProfile) => void;

const listeners = new Set<ProfileListener>();

export function subscribeProfileUpdates(listener: ProfileListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitProfileUpdate(profile: UserProfile) {
  listeners.forEach((listener) => listener(profile));
}
