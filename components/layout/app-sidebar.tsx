"use client";

import Link from "next/link";
import {
  Users,
  BookOpen,
  FileText,
  ClipboardCheck,
  ListChecks,
  Sparkles,
  GraduationCap,
  NotebookPen,
  User as UserIcon,
  ChevronLeft,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LeafDecoration } from "@/components/brand/leaf-decoration";
import { SidebarNav, type NavItem } from "./sidebar-nav";

export function AppSidebar({
  classroomId,
  isTeacher,
  todoCount = 0,
}: {
  classroomId: string;
  isTeacher: boolean;
  todoCount?: number;
}) {
  const base = `/classroom/${classroomId}`;

  const items: NavItem[] = [
    ...(isTeacher
      ? [{ label: "People", href: `${base}/people`, icon: Users }]
      : []),
    { label: "Lessons", href: `${base}/lessons`, icon: BookOpen },
    { label: "Assignments", href: `${base}/assignments`, icon: FileText },
    { label: "Quizzes", href: `${base}/quizzes`, icon: ClipboardCheck },
    // Teachers get a class gradebook; students get their own /scores view instead.
    ...(isTeacher
      ? [{ label: "Grades", href: `${base}/grades`, icon: NotebookPen }]
      : []),
    // Students get a cross-class "what do I still owe?" view; teachers don't.
    ...(!isTeacher
      ? [
          { label: "To-do", href: "/todo", icon: ListChecks, badge: todoCount },
          { label: "Scores", href: "/scores", icon: GraduationCap },
          { label: "My Buddy", href: "/pet", icon: Sparkles },
        ]
      : []),
    { label: "Profile", href: `/profile`, icon: UserIcon },
  ];

  return (
    <aside className="relative flex w-64 shrink-0 flex-col border-r border-gray-100 bg-white">
      <div className="px-6 py-5">
        <Link href="/dashboard">
          <Logo width={180} />
        </Link>
      </div>

      <Link
        href="/dashboard"
        className="mx-4 mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-brand-600"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        All classes
      </Link>

      <SidebarNav items={items} />

      <LeafDecoration className="pointer-events-none absolute bottom-0 left-0 h-56 w-48 opacity-90" />
    </aside>
  );
}
