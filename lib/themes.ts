/**
 * Background themes.
 *
 * A theme changes the page BACKGROUND only — never text, cards, or controls.
 * Every backdrop is a pale tint with a low-contrast pattern, so white cards and
 * dark text keep the same contrast ratio no matter what a kid picks. Legibility
 * is not a per-theme decision; it's guaranteed by construction.
 *
 * The actual CSS lives in globals.css under [data-theme="<id>"].
 */

export type ThemeId =
  | "default"
  | "cars"
  | "animals"
  | "magic"
  | "space"
  | "ocean";

export type Theme = {
  id: ThemeId;
  label: string;
  emoji: string;
  description: string;
  /** Small colour chip shown in the picker. */
  swatch: string;
};

export const THEMES: Theme[] = [
  {
    id: "default",
    label: "Inclusive World",
    emoji: "🌿",
    description: "Our classic soft leaves.",
    swatch: "#f8f9fb",
  },
  {
    id: "cars",
    label: "Cars",
    emoji: "🚗",
    description: "Little cars on the road.",
    swatch: "#eef3fa",
  },
  {
    id: "animals",
    label: "Animals",
    emoji: "🐾",
    description: "Paw prints everywhere.",
    swatch: "#eff7ef",
  },
  {
    id: "magic",
    label: "Magic",
    emoji: "✨",
    description: "Castles, stars, and sparkles.",
    swatch: "#f4eefc",
  },
  {
    id: "space",
    label: "Space",
    emoji: "🚀",
    description: "Rockets, planets, and stars.",
    swatch: "#eef0fb",
  },
  {
    id: "ocean",
    label: "Ocean",
    emoji: "🌊",
    description: "Waves, fish, and bubbles.",
    swatch: "#e9f6fa",
  },
];

const THEME_IDS = new Set<string>(THEMES.map((t) => t.id));

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEME_IDS.has(value);
}

/** Falls back to the default theme for unknown/legacy values. */
export function normalizeTheme(value: unknown): ThemeId {
  return isThemeId(value) ? value : "default";
}
