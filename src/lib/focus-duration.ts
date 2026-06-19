import type { StudyPlanResult } from "@/lib/api/studyPlan";
import type { UpcomingSession } from "@/lib/api/dashboard";

export const FOCUS_DURATION_AUTO = "auto" as const;
export const DEFAULT_FOCUS_MINUTES = 25;
export const FOCUS_DURATION_OPTIONS = [15, 25, 30, 45, 60] as const;

export type FocusDurationPreference =
  | typeof FOCUS_DURATION_AUTO
  | (typeof FOCUS_DURATION_OPTIONS)[number];

const DURATION_KEY = "studymate_focus_duration_minutes";
export const FOCUS_DURATION_UPDATED_EVENT = "studymate-focus-duration-updated";

type FocusDurationListener = (preference: FocusDurationPreference) => void;
const listeners = new Set<FocusDurationListener>();

function parseStoredPreference(raw: string | null): FocusDurationPreference {
  if (raw === null || raw === FOCUS_DURATION_AUTO) return FOCUS_DURATION_AUTO;
  const minutes = Number.parseInt(raw, 10);
  if (FOCUS_DURATION_OPTIONS.includes(minutes as (typeof FOCUS_DURATION_OPTIONS)[number])) {
    return minutes as (typeof FOCUS_DURATION_OPTIONS)[number];
  }
  return FOCUS_DURATION_AUTO;
}

export function getFocusDurationPreference(): FocusDurationPreference {
  if (typeof window === "undefined") return FOCUS_DURATION_AUTO;
  return parseStoredPreference(localStorage.getItem(DURATION_KEY));
}

export function setFocusDurationPreference(preference: FocusDurationPreference) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DURATION_KEY, String(preference));
  listeners.forEach((listener) => listener(preference));
  window.dispatchEvent(new CustomEvent(FOCUS_DURATION_UPDATED_EVENT, { detail: { preference } }));
}

export function subscribeFocusDurationPreference(listener: FocusDurationListener) {
  listener(getFocusDurationPreference());
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function resolveAutoFocusMinutes(
  plan: StudyPlanResult | null,
  nextSession: UpcomingSession | null,
): number {
  if (nextSession && plan?.study_plan?.length) {
    const planDay = plan.study_plan.find(
      (day) => day.topic.trim().toLowerCase() === nextSession.topic.trim().toLowerCase(),
    );
    if (planDay?.estimated_hours) {
      return Math.min(60, Math.max(15, Math.round(planDay.estimated_hours * 60)));
    }
  }

  if (plan?.study_hours_per_day) {
    return Math.min(60, Math.max(15, Math.round((plan.study_hours_per_day * 60) / 4)));
  }

  return DEFAULT_FOCUS_MINUTES;
}

export function resolveEffectiveFocusMinutes(
  plan: StudyPlanResult | null,
  nextSession: UpcomingSession | null,
): number {
  const preference = getFocusDurationPreference();
  if (preference !== FOCUS_DURATION_AUTO) return preference;
  return resolveAutoFocusMinutes(plan, nextSession);
}

export function formatFocusDurationLabel(preference: FocusDurationPreference) {
  if (preference === FOCUS_DURATION_AUTO) return "Auto (from study plan)";
  return `${preference} minutes`;
}
