import { API_URL } from "./config";
import { getAuthToken } from "@/lib/auth";
import { ApiError } from "./auth";

export type Note = {
  noteId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadStatus: string;
  uploadedAt: string;
  hasSummary: boolean;
  summaryGeneratedAt: string | null;
  hasStudyMaterial: boolean;
  studyMaterialGeneratedAt: string | null;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

export function validateNoteFile(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return "Unsupported file type. Only PDF, DOCX, and TXT are allowed.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File size exceeds 10 MB limit.";
  }

  return null;
}

export async function fetchNotes(): Promise<Note[]> {
  const { authFetch } = await import("./client");
  const data = await authFetch("/api/notes");
  return (data as { notes: Note[] }).notes;
}

export async function deleteNote(noteId: number): Promise<void> {
  const { authFetch } = await import("./client");
  await authFetch(`/api/notes/${noteId}`, { method: "DELETE" });
}

export function uploadNote(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<Note> {
  const validationError = validateNoteFile(file);
  if (validationError) {
    return Promise.reject(new ApiError(400, validationError));
  }

  const token = getAuthToken();
  if (!token) {
    return Promise.reject(new ApiError(401, "Authentication required"));
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      let data: { message?: string; note?: Note; errors?: { field: string; message: string }[] };

      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(new ApiError(xhr.status, "Upload failed"));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && data.note) {
        resolve(data.note);
        return;
      }

      reject(new ApiError(xhr.status, data.message ?? "Upload failed", data.errors));
    });

    xhr.addEventListener("error", () => {
      reject(new ApiError(0, "Network error during upload"));
    });

    xhr.open("POST", `${API_URL}/api/notes/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
}
