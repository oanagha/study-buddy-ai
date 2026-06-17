import { authFetch } from "./client";

export type DashboardOverview = {
  notes_uploaded: number;
  flashcards_generated: number;
  quizzes_completed: number;
  study_streak: number;
};

export type WeeklyActivityDay = {
  day: string;
  hours: number;
};

export type UpcomingSession = {
  topic: string;
  date: string;
  time: string;
};

export type RecentUpload = {
  title: string;
  uploaded_at: string;
  size: string;
};

export type SubjectProgress = {
  subject: string;
  progress: number;
};

export type RecentQuiz = {
  title: string;
  score: number;
  questions: number;
  completed_at: string;
};

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const data = await authFetch("/api/dashboard/overview");

  const result = data as DashboardOverview & { status: string };
  return {
    notes_uploaded: result.notes_uploaded ?? 0,
    flashcards_generated: result.flashcards_generated ?? 0,
    quizzes_completed: result.quizzes_completed ?? 0,
    study_streak: result.study_streak ?? 0,
  };
}

export async function fetchWeeklyActivity(): Promise<WeeklyActivityDay[]> {
  const data = await authFetch("/api/dashboard/weekly-activity");
  const result = data as { status: string; weekly_activity?: WeeklyActivityDay[] };
  return result.weekly_activity ?? [];
}

export async function fetchUpcomingSessions(): Promise<UpcomingSession[]> {
  const data = await authFetch("/api/dashboard/upcoming-sessions");
  const result = data as { status: string; sessions?: UpcomingSession[] };
  return result.sessions ?? [];
}

export async function fetchRecentUploads(): Promise<RecentUpload[]> {
  const data = await authFetch("/api/dashboard/recent-uploads");
  const result = data as { status: string; uploads?: RecentUpload[] };
  return result.uploads ?? [];
}

export async function fetchLearningProgress(): Promise<SubjectProgress[]> {
  const data = await authFetch("/api/dashboard/progress");
  const result = data as { status: string; subjects?: SubjectProgress[] };
  return result.subjects ?? [];
}

export async function fetchRecentQuizzes(): Promise<RecentQuiz[]> {
  const data = await authFetch("/api/dashboard/recent-quizzes");
  const result = data as { status: string; quizzes?: RecentQuiz[] };
  return result.quizzes ?? [];
}
