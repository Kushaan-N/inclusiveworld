"use client";

import { useEffect, useState } from "react";
import { Shuffle, Sparkles, X } from "lucide-react";
import { ReadAloud } from "@/components/ui/read-aloud";
import { cn } from "@/lib/utils";
import {
  CATEGORY_META,
  getSurpriseById,
  randomSurprise,
  revealLabelFor,
  surpriseForLogin,
  type Surprise,
} from "@/lib/daily-surprise";

// The surprise chosen for the current login: { loginKey, id }. Kept so the pick
// stays put as the student moves around during a session, and so the next login
// can avoid repeating it.
const CURRENT_KEY = "dailySurprise:current";
const DISMISSED_KEY = "dailySurprise:dismissed";

type StoredPick = { loginKey: string; id: string };

function readStoredPick(): StoredPick | null {
  try {
    const raw = window.localStorage.getItem(CURRENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPick;
    return parsed && parsed.id ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * A cheerful banner that greets students at login with a rotating surprise —
 * a fun fact, joke, animal, Python challenge, or riddle. It's seeded by the
 * user's last login, so it stays put as they move around during a session but
 * is something new the next time they sign in.
 */
export function DailySurprise({ loginKey }: { loginKey: string }) {
  // `null` = not resolved yet (or hidden). Resolved on mount from localStorage
  // so the banner never repeats the previous login's pick and stays dismissed.
  const [surprise, setSurprise] = useState<Surprise | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already dismissed for this login? Stay hidden until the next one.
    if (window.localStorage.getItem(DISMISSED_KEY) === loginKey) return;

    const stored = readStoredPick();

    // Same login as last time — reuse the pick so it stays steady while the
    // student navigates around during the session.
    let picked =
      stored && stored.loginKey === loginKey
        ? getSurpriseById(stored.id)
        : undefined;

    // New login (or first ever): pick fresh, avoiding the previous login's pick.
    if (!picked) {
      picked = surpriseForLogin(loginKey, stored?.id);
      try {
        window.localStorage.setItem(
          CURRENT_KEY,
          JSON.stringify({ loginKey, id: picked.id })
        );
      } catch {
        // localStorage can be unavailable (private mode); the banner still shows.
      }
    }

    // Resolving the login's surprise from localStorage is an external-system
    // sync, which is the intended use of an effect here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSurprise(picked);
  }, [loginKey]);

  if (dismissed || !surprise) return null;

  const meta = CATEGORY_META[surprise.category];
  const spoken = revealed && surprise.reveal
    ? `${surprise.text}. ${surprise.reveal}`
    : surprise.text;

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, loginKey);
    } catch {
      // Non-fatal: it'll just reappear on the next visit.
    }
  }

  function showAnother() {
    const next = randomSurprise(surprise?.id);
    setSurprise(next);
    setRevealed(false);
    try {
      // Persist so the new pick sticks if they navigate around this session.
      window.localStorage.setItem(
        CURRENT_KEY,
        JSON.stringify({ loginKey, id: next.id })
      );
    } catch {
      // Non-fatal: it'll just fall back to the seeded pick on reload.
    }
  }

  return (
    <div
      className={cn(
        "relative mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br p-5 shadow-sm sm:p-6",
        meta.gradient
      )}
      role="region"
      aria-label="Daily surprise"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/70 text-2xl shadow-sm"
          aria-hidden
        >
          {meta.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                meta.accent
              )}
            >
              <Sparkles className="h-3 w-3" />
              {meta.label}
            </span>
            <span className="text-xs font-medium text-gray-500">
              A little surprise, just for you
            </span>
          </div>

          <p className="whitespace-pre-line text-base font-semibold leading-relaxed text-gray-800 sm:text-lg">
            {surprise.text}
          </p>

          {surprise.reveal && (
            <div className="mt-3">
              {revealed ? (
                <p className="whitespace-pre-line rounded-xl bg-white/70 px-4 py-3 text-base font-semibold leading-relaxed text-gray-800">
                  {surprise.reveal}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="inline-flex items-center rounded-full border border-white/80 bg-white/70 px-4 py-1.5 text-sm font-bold text-gray-700 transition-colors hover:bg-white"
                >
                  {revealLabelFor(surprise)}
                </button>
              )}
            </div>
          )}

          <div className="mt-4">
            <ReadAloud text={spoken} label="Read to me" />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={showAnother}
            aria-label="Show me another surprise"
            className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/60 px-2.5 py-1 text-xs font-bold text-gray-600 transition-colors hover:bg-white hover:text-gray-800"
          >
            <Shuffle className="h-3 w-3" aria-hidden />
            <span className="hidden sm:inline">Surprise me!</span>
            <span className="sm:hidden">New</span>
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Hide today's surprise"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/60 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
