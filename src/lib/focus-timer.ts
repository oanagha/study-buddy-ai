const STORAGE_KEY = "studymate_focus_timer";

export type FocusTimerSnapshot = {
  running: boolean;
  endsAt: number | null;
  secondsLeft: number;
  durationSeconds: number;
};

function normalizeSnapshot(snapshot: FocusTimerSnapshot): FocusTimerSnapshot {
  if (snapshot.running && snapshot.endsAt) {
    const remaining = Math.ceil((snapshot.endsAt - Date.now()) / 1000);
    if (remaining <= 0) {
      return {
        running: false,
        endsAt: null,
        secondsLeft: snapshot.durationSeconds,
        durationSeconds: snapshot.durationSeconds,
      };
    }
    return { ...snapshot, secondsLeft: remaining };
  }
  return snapshot;
}

export function readFocusTimer(): FocusTimerSnapshot | null {
  return readFocusTimerState().snapshot;
}

export function readFocusTimerState(): {
  snapshot: FocusTimerSnapshot | null;
  expiredWhileRunning: boolean;
} {
  if (typeof window === "undefined") {
    return { snapshot: null, expiredWhileRunning: false };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { snapshot: null, expiredWhileRunning: false };

    const parsed = JSON.parse(raw) as FocusTimerSnapshot;
    if (
      typeof parsed.secondsLeft !== "number" ||
      typeof parsed.durationSeconds !== "number" ||
      typeof parsed.running !== "boolean"
    ) {
      return { snapshot: null, expiredWhileRunning: false };
    }

    const expiredWhileRunning = Boolean(
      parsed.running && parsed.endsAt && parsed.endsAt <= Date.now(),
    );
    const snapshot = normalizeSnapshot(parsed);

    if (expiredWhileRunning) {
      writeFocusTimer(snapshot);
    }

    return { snapshot, expiredWhileRunning };
  } catch {
    return { snapshot: null, expiredWhileRunning: false };
  }
}

export function writeFocusTimer(snapshot: FocusTimerSnapshot) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSnapshot(snapshot)));
}

export function hasActiveFocusSession(snapshot: FocusTimerSnapshot) {
  return snapshot.running || snapshot.secondsLeft < snapshot.durationSeconds;
}

export function clearFocusTimer() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
