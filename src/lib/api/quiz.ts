import { authFetch } from "./client";

export type QuizDifficulty = "Easy" | "Medium" | "Hard";

export type QuizQuestion = {
  question: string;
  options: string[];
  correct_index: number;
};

export type QuizResult = {
  quiz_id: number;
  difficulty: QuizDifficulty;
  question_count: number;
  questions: QuizQuestion[];
  created_at?: string;
  cached?: boolean;
};

export async function generateQuiz(
  noteId: number,
  difficulty: QuizDifficulty,
  questionCount: number,
): Promise<QuizResult> {
  const data = await authFetch("/api/ai/generate-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      note_id: noteId,
      difficulty,
      question_count: questionCount,
    }),
  });

  const result = data as QuizResult & { status: string; message: string };
  return {
    quiz_id: result.quiz_id,
    difficulty: result.difficulty,
    question_count: result.question_count,
    questions: result.questions,
    created_at: result.created_at,
    cached: result.cached,
  };
}
