import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/lib/api/profile";
import { fetchSettings } from "@/lib/api/settings";
import {
  fetchDashboardOverview,
  fetchWeeklyActivity,
  fetchUpcomingSessions,
  fetchRecentUploads,
  fetchLearningProgress,
  fetchRecentQuizzes,
} from "@/lib/api/dashboard";
import { fetchActiveStudyPlan } from "@/lib/api/studyPlan";
import { fetchNotes } from "@/lib/api/notes";
import { queryKeys } from "./keys";

export const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfile,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: fetchSettings,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useDashboardOverviewQuery() {
  return useQuery({
    queryKey: queryKeys.dashboardOverview,
    queryFn: fetchDashboardOverview,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useWeeklyActivityQuery() {
  return useQuery({
    queryKey: queryKeys.dashboardWeekly,
    queryFn: fetchWeeklyActivity,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useUpcomingSessionsQuery() {
  return useQuery({
    queryKey: queryKeys.dashboardSessions,
    queryFn: fetchUpcomingSessions,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useRecentUploadsQuery() {
  return useQuery({
    queryKey: queryKeys.dashboardUploads,
    queryFn: fetchRecentUploads,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useLearningProgressQuery() {
  return useQuery({
    queryKey: queryKeys.dashboardProgress,
    queryFn: fetchLearningProgress,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useRecentQuizzesQuery() {
  return useQuery({
    queryKey: queryKeys.dashboardQuizzes,
    queryFn: fetchRecentQuizzes,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useStudyPlanQuery() {
  return useQuery({
    queryKey: queryKeys.studyPlan,
    queryFn: fetchActiveStudyPlan,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useNotesQuery() {
  return useQuery({
    queryKey: queryKeys.notes,
    queryFn: fetchNotes,
    staleTime: DEFAULT_STALE_TIME,
  });
}
