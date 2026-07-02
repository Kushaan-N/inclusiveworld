// Shared string-enum values (stored as strings for SQLite portability).

export const Role = {
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ClassRole = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;
export type ClassRole = (typeof ClassRole)[keyof typeof ClassRole];

export const MemberStatus = {
  ACTIVE: "ACTIVE",
  PENDING_INVITE: "PENDING_INVITE",
} as const;
export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus];

/** A membership role that can manage the class (create/edit content, invite). */
export function isTeacherRole(roleInClass: string): boolean {
  return roleInClass === ClassRole.ADMIN || roleInClass === ClassRole.TEACHER;
}

// A curated set of classroom emojis + colors offered when creating a class.
export const CLASS_THEMES = [
  { emoji: "🐍", color: "#3b6fb0" },
  { emoji: "📚", color: "#c0143c" },
  { emoji: "🔬", color: "#0f766e" },
  { emoji: "🎨", color: "#b45309" },
  { emoji: "🧮", color: "#6d28d9" },
  { emoji: "🌍", color: "#15803d" },
  { emoji: "🎵", color: "#be185d" },
  { emoji: "💻", color: "#1e40af" },
];
