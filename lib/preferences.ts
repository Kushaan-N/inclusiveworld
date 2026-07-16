/**
 * Reading / display preferences.
 *
 * Each preference maps to a data-* attribute on <html> and is styled in
 * globals.css. Like themes, these only affect presentation — text size,
 * spacing, and font — never layout structure, so nothing can break or become
 * unreadable regardless of the combination a kid picks.
 */

export type TextScale = "normal" | "large" | "xlarge";
export type LineSpacing = "normal" | "relaxed";
export type ReadingFont = "default" | "easy";

export type DisplayPrefs = {
  textScale: TextScale;
  lineSpacing: LineSpacing;
  readingFont: ReadingFont;
};

export const TEXT_SCALES: { id: TextScale; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "large", label: "Large" },
  { id: "xlarge", label: "Extra large" },
];

export const LINE_SPACINGS: { id: LineSpacing; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "relaxed", label: "Relaxed" },
];

export const READING_FONTS: { id: ReadingFont; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "easy", label: "Easy-read" },
];

// The three preference keys and their allowed values, so a single server
// action can validate any of them generically.
export const DISPLAY_PREF_OPTIONS = {
  textScale: TEXT_SCALES.map((t) => t.id),
  lineSpacing: LINE_SPACINGS.map((l) => l.id),
  readingFont: READING_FONTS.map((r) => r.id),
} as const;

export type DisplayPrefKey = keyof typeof DISPLAY_PREF_OPTIONS;

export function isDisplayPrefKey(key: string): key is DisplayPrefKey {
  return key in DISPLAY_PREF_OPTIONS;
}

export function isValidPrefValue(key: DisplayPrefKey, value: string): boolean {
  return (DISPLAY_PREF_OPTIONS[key] as readonly string[]).includes(value);
}

/** Coerce a possibly-stale record into a valid, complete prefs object. */
export function normalizePrefs(input: {
  textScale?: string | null;
  lineSpacing?: string | null;
  readingFont?: string | null;
}): DisplayPrefs {
  const pick = <T extends string>(
    key: DisplayPrefKey,
    value: string | null | undefined,
    fallback: T
  ): T => (value && isValidPrefValue(key, value) ? (value as T) : fallback);

  return {
    textScale: pick<TextScale>("textScale", input.textScale, "normal"),
    lineSpacing: pick<LineSpacing>("lineSpacing", input.lineSpacing, "normal"),
    readingFont: pick<ReadingFont>("readingFont", input.readingFont, "default"),
  };
}
