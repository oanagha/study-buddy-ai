import { authFetch } from "./client";

export type SummaryResult = {
  short_summary: string;
  detailed_summary: string;
  key_points: string[];
  generated_at?: string;
  cached?: boolean;
};

export type StudyTopic = {
  title: string;
  importance: "high" | "medium" | "low";
  summary: string;
  key_terms: string[];
  exam_tips: string;
};

export type ExamFocus = {
  must_know: string[];
  likely_exam_topics: string[];
  quick_revision_checklist: string[];
};

export type PracticeQuestion = {
  question: string;
  answer_hint: string;
};

export type StudyMaterialResult = {
  document_overview: string;
  exam_focus: ExamFocus;
  all_topics: StudyTopic[];
  study_plan: string[];
  practice_questions: PracticeQuestion[];
  generated_at?: string;
  cached?: boolean;
};

export async function summarizeNote(
  noteId: number,
  options?: { forceRegenerate?: boolean },
): Promise<SummaryResult> {
  const data = await authFetch("/api/ai/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      note_id: noteId,
      force_regenerate: options?.forceRegenerate ?? false,
    }),
  });

  const result = data as SummaryResult & { status: string; message: string };
  return {
    short_summary: result.short_summary,
    detailed_summary: result.detailed_summary,
    key_points: result.key_points,
    generated_at: result.generated_at,
    cached: result.cached,
  };
}

export async function fetchSummary(noteId: number): Promise<SummaryResult> {
  const data = await authFetch(`/api/ai/summary/${noteId}`);
  const result = data as SummaryResult & { status: string; message: string };
  return {
    short_summary: result.short_summary,
    detailed_summary: result.detailed_summary,
    key_points: result.key_points,
    generated_at: result.generated_at,
    cached: result.cached,
  };
}

export async function generateStudyMaterial(
  noteId: number,
  options?: { forceRegenerate?: boolean },
): Promise<StudyMaterialResult> {
  const data = await authFetch("/api/ai/study-material", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      note_id: noteId,
      force_regenerate: options?.forceRegenerate ?? false,
    }),
  });

  const result = data as StudyMaterialResult & { status: string; message: string };
  return {
    document_overview: result.document_overview,
    exam_focus: result.exam_focus,
    all_topics: result.all_topics,
    study_plan: result.study_plan,
    practice_questions: result.practice_questions,
    generated_at: result.generated_at,
    cached: result.cached,
  };
}

export async function fetchStudyMaterial(noteId: number): Promise<StudyMaterialResult> {
  const data = await authFetch(`/api/ai/study-material/${noteId}`);
  const result = data as StudyMaterialResult & { status: string; message: string };
  return {
    document_overview: result.document_overview,
    exam_focus: result.exam_focus,
    all_topics: result.all_topics,
    study_plan: result.study_plan,
    practice_questions: result.practice_questions,
    generated_at: result.generated_at,
    cached: result.cached,
  };
}
