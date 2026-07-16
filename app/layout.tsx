import type { Metadata } from "next";
import { Inter, Atkinson_Hyperlegible } from "next/font/google";
import { getCurrentUser } from "@/lib/auth-helpers";
import { normalizeTheme } from "@/lib/themes";
import { normalizePrefs } from "@/lib/preferences";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Legibility-first typeface offered via the "Easy-read font" preference.
const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inclusive World — Where Abilities Lead the Way",
  description:
    "An inclusive learning platform where teachers create classrooms and students learn together.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Signed-out pages (login/register) just get the defaults.
  const user = await getCurrentUser();
  const theme = normalizeTheme(user?.theme);
  const prefs = normalizePrefs(user ?? {});

  return (
    <html
      lang="en"
      className={`${inter.variable} ${atkinson.variable}`}
      data-theme={theme}
      data-text-scale={prefs.textScale}
      data-line-spacing={prefs.lineSpacing}
      data-reading-font={prefs.readingFont}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
