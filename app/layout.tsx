import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getCurrentUser } from "@/lib/auth-helpers";
import { normalizeTheme } from "@/lib/themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
  // Signed-out pages (login/register) just get the default backdrop.
  const user = await getCurrentUser();
  const theme = normalizeTheme(user?.theme);

  return (
    <html lang="en" className={inter.variable} data-theme={theme}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
