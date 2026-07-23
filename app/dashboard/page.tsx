import Link from "next/link";
import {
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  ClipboardCheck,
  PartyPopper,
} from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import {
  getUserClassrooms,
  getTodoItems,
  getScoresData,
  type TodoItem,
} from "@/lib/queries";
import { dueInfo, type DueTone } from "@/lib/due";
import { TopBar } from "@/components/layout/top-bar";
import { Logo } from "@/components/brand/logo";
import { Card, EmptyState, Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { DashboardActions } from "./dashboard-actions";
import { ScoreboardWidget } from "./scoreboard-widget";
import { DailySurprise } from "./daily-surprise";
import { isTeacherRole } from "@/lib/constants";

const DASHBOARD_TODO_LIMIT = 4;

export default async function DashboardPage() {
  const user = await requireUser();
  const classrooms = await getUserClassrooms(user.id);
  const isTeacher = user.role === "TEACHER";
  const todoItems = isTeacher ? [] : await getTodoItems(user.id);
  const scores = isTeacher ? null : await getScoresData(user.id);

  return (
    <div className="min-h-screen">
      <TopBar
        user={{
          id: user.id,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }}
        left={<Logo width={185} />}
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        {!isTeacher && (
          <DailySurprise
            loginKey={user.lastLogin?.toISOString() ?? user.id}
          />
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name.split(" ")[0]}! 👋
            </h1>
            <p className="mt-1 text-gray-500">
              {isTeacher
                ? "Manage your classrooms or start a new one."
                : "Jump back into your classes or join a new one."}
            </p>
          </div>
          <DashboardActions isTeacher={isTeacher} />
        </div>

        {!isTeacher && classrooms.length > 0 && (
          <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:items-start">
            <Card className="p-6">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-900">What&apos;s left</h2>
                {todoItems.length > DASHBOARD_TODO_LIMIT && (
                  <Link
                    href="/todo"
                    className="text-sm font-semibold text-brand-600 hover:underline"
                  >
                    See all {todoItems.length}
                  </Link>
                )}
              </div>

              {todoItems.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    icon={<PartyPopper className="h-6 w-6" />}
                    title="You're all caught up!"
                    description="Nothing to turn in right now."
                  />
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {todoItems.slice(0, DASHBOARD_TODO_LIMIT).map((item) => (
                    <li key={`${item.kind}-${item.id}`}>
                      <TodoPreviewRow item={item} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {scores && <ScoreboardWidget scores={scores} />}
          </div>
        )}

        <div className="mt-8">
          {classrooms.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="h-7 w-7" />}
              title={isTeacher ? "No classrooms yet" : "You haven't joined a class yet"}
              description={
                isTeacher
                  ? "Create your first classroom to start adding lessons, assignments, and quizzes."
                  : "Ask your teacher for an 8-character class code, then join to start learning."
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {classrooms.map((c) => (
                <ClassroomCard key={c.id} classroom={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const dueTextTones: Record<DueTone, string> = {
  overdue: "text-brand-600",
  soon: "text-amber-600",
  later: "text-amber-600",
  none: "text-gray-400",
};

/** Compact row for the dashboard's "What's left" preview — a lighter cousin of TodoRow on the full /todo page. */
function TodoPreviewRow({ item }: { item: TodoItem }) {
  const due = dueInfo(item.dueDate);
  const Icon = item.kind === "quiz" ? ClipboardCheck : FileText;

  return (
    <Link href={item.href}>
      <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-shadow hover:shadow-md">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-pinklite text-brand-600">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">{item.title}</p>
          <p className="truncate text-xs text-gray-500">{item.className}</p>
        </div>
        <span className={cn("shrink-0 text-xs font-bold", dueTextTones[due.tone])}>
          {item.kind === "quiz" && !item.dueDate ? "Quiz" : due.label}
        </span>
      </div>
    </Link>
  );
}

type ClassroomCardData = Awaited<ReturnType<typeof getUserClassrooms>>[number];

function ClassroomCard({ classroom }: { classroom: ClassroomCardData }) {
  const teacher = isTeacherRole(classroom.roleInClass);
  const counts = (classroom as unknown as {
    _count: { memberships: number; lessons: number; assignments: number };
  })._count;

  return (
    <Link href={`/classroom/${classroom.id}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
        <div
          className="flex h-24 items-center justify-between px-5"
          style={{ backgroundColor: classroom.color }}
        >
          <span className="text-4xl">{classroom.emoji}</span>
          <Badge tone={teacher ? "red" : "blue"} className="bg-white/90">
            {teacher ? "Teaching" : "Student"}
          </Badge>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-700">
            {classroom.name}
          </h3>
          {classroom.subject && (
            <p className="text-sm text-gray-500">{classroom.subject}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {counts.memberships}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> {counts.lessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" /> {counts.assignments}
            </span>
          </div>
          {teacher && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-pink px-3 py-2">
              <span className="text-xs text-gray-500">Class code</span>
              <span className="font-mono text-sm font-bold tracking-widest text-brand-700">
                {classroom.joinCode}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
