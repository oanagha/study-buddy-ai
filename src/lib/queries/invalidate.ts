import type { QueryClient } from "@tanstack/react-query";
import type { Note } from "@/lib/api/notes";
import type { StudyPlanResult } from "@/lib/api/studyPlan";
import { queryKeys } from "./keys";

export function patchNotesCache(
  queryClient: QueryClient,
  updater: (notes: Note[]) => Note[],
) {
  queryClient.setQueryData<Note[]>(queryKeys.notes, (current) =>
    current ? updater(current) : current,
  );
}

export function invalidateNotesQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboardUploads });
}

export function invalidateStudyPlanQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.studyPlan });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSessions });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview });
}

export function setStudyPlanCache(queryClient: QueryClient, plan: StudyPlanResult) {
  queryClient.setQueryData(queryKeys.studyPlan, plan);
}
