import { authFetch } from "./client";

export type Flashcard = {
  question: string;
  answer: string;
};

export type FlashcardSetResult = {
  flashcard_set_id?: number;
  card_count?: number;
  flashcards: Flashcard[];
  created_at?: string;
  cached?: boolean;
};

export async function fetchFlashcards(noteId: number): Promise<FlashcardSetResult> {
  const data = await authFetch(`/api/flashcards/${noteId}`);
  const result = data as FlashcardSetResult & { status: string };
  return {
    flashcard_set_id: result.flashcard_set_id,
    card_count: result.card_count,
    flashcards: result.flashcards ?? [],
    created_at: result.created_at,
  };
}

export async function generateFlashcards(
  noteId: number,
  cardCount = 20,
): Promise<FlashcardSetResult> {
  const data = await authFetch("/api/ai/generate-flashcards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      note_id: noteId,
      card_count: cardCount,
    }),
  });

  const result = data as FlashcardSetResult & { status: string; message: string };
  return {
    flashcard_set_id: result.flashcard_set_id,
    card_count: result.card_count,
    flashcards: result.flashcards,
    created_at: result.created_at,
    cached: result.cached,
  };
}
