"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Palette } from "lucide-react";
import { THEMES, type ThemeId } from "@/lib/themes";
import { setTheme } from "@/lib/actions/theme";
import { cn } from "@/lib/utils";

/**
 * Background theme picker. Available to every signed-in user (students and
 * teachers alike).
 *
 * Applying the theme is optimistic: we stamp data-theme onto <html> right away
 * so the background changes the instant you pick, then persist in the
 * background. If the save fails we put the old theme back.
 */
export function ThemePicker({ current }: { current: ThemeId }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ThemeId>(current);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Keep in sync if the server sends a different theme (e.g. another tab).
  useEffect(() => setActive(current), [current]);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function pick(id: ThemeId) {
    const previous = active;
    setActive(id);
    document.documentElement.dataset.theme = id;
    setOpen(false);

    startTransition(async () => {
      const res = await setTheme(id);
      if (!res.ok) {
        setActive(previous);
        document.documentElement.dataset.theme = previous;
      }
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change background theme"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-brand-600"
      >
        <Palette className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="font-bold text-gray-900">Pick a background</p>
            <p className="text-xs text-gray-500">
              Only the background changes — everything stays easy to read.
            </p>
          </div>
          <ul className="max-h-80 overflow-y-auto scrollbar-thin p-2">
            {THEMES.map((theme) => {
              const selected = theme.id === active;
              return (
                <li key={theme.id}>
                  <button
                    onClick={() => pick(theme.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      selected ? "bg-brand-50" : "hover:bg-gray-50"
                    )}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-lg"
                      style={{ backgroundColor: theme.swatch }}
                      aria-hidden
                    >
                      {theme.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-sm font-semibold",
                          selected ? "text-brand-700" : "text-gray-900"
                        )}
                      >
                        {theme.label}
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {theme.description}
                      </span>
                    </span>
                    {selected && (
                      <Check className="h-5 w-5 shrink-0 text-brand-600" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
