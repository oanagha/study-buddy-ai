import { authFetch } from "./client";

export type StudyLevel = "Beginner" | "Intermediate" | "Advanced";

export type StudyPlanDay = {
  day: number;
  topic: string;
  estimated_hours: number;
};

export type StudyPlanResult = {
  plan_id?: number;
  subject?: string;
  exam_date?: string;
  study_hours_per_day?: number;
  current_level?: StudyLevel;
  days_remaining?: number;
  study_plan: StudyPlanDay[];
  completed_days?: number[];
  is_completed?: boolean;
  created_at?: string;
  cached?: boolean;
};

export type GenerateStudyPlanPayload = {
  subject: string;
  exam_date: string;
  study_hours_per_day: number;
  current_level?: StudyLevel;
};

function mapStudyPlanResult(result: StudyPlanResult & { status?: string; message?: string }) {
  return {
    plan_id: result.plan_id,
    subject: result.subject,
    exam_date: result.exam_date,
    study_hours_per_day: result.study_hours_per_day,
    current_level: result.current_level,
    days_remaining: result.days_remaining,
    study_plan: result.study_plan ?? [],
    completed_days: result.completed_days ?? [],
    is_completed: result.is_completed ?? false,
    created_at: result.created_at,
    cached: result.cached,
  };
}

export async function fetchActiveStudyPlan(): Promise<StudyPlanResult> {
  const data = await authFetch("/api/ai/study-plan/active");
  return mapStudyPlanResult(data as StudyPlanResult & { status: string });
}

export async function generateStudyPlan(
  payload: GenerateStudyPlanPayload,
): Promise<StudyPlanResult> {
  const data = await authFetch("/api/ai/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return mapStudyPlanResult(data as StudyPlanResult & { status: string; message: string });
}

export async function updateStudyPlanProgress(
  planId: number,
  completedDays: number[],
): Promise<StudyPlanResult> {
  const data = await authFetch(`/api/ai/study-plan/${planId}/progress`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed_days: completedDays }),
  });

  return mapStudyPlanResult(data as StudyPlanResult & { status: string; message: string });
}

export const COMPLETION_QUOTES = [
  "You did it! Every topic conquered — your future self is cheering for you.",
  "Plan complete! Discipline today becomes confidence on exam day.",
  "Outstanding work! You turned a roadmap into real progress.",
  "All days done! You're not just prepared — you're exam-ready.",
  "Champion mindset unlocked. Keep this momentum into your exam!",
  "You finished the full plan. That kind of consistency wins.",
  "Incredible dedication! Your hard work is your competitive advantage.",
  "Mission accomplished. Walk into that exam knowing you earned it.",
];

export function getRandomCompletionQuote() {
  return COMPLETION_QUOTES[Math.floor(Math.random() * COMPLETION_QUOTES.length)];
}
