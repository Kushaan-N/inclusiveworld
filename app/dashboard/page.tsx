import Link from "next/link";
import {
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  ListChecks,
  ChevronRight,
} from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { getUserClassrooms, getTodoCount, getPetState } from "@/lib/queries";
import { TopBar } from "@/components/layout/top-bar";
import { Logo } from "@/components/brand/logo";
import { Card, EmptyState, Badge } from "@/components/ui/primitives";
import { PetAvatar } from "@/components/pet/pet-avatar";
import { DashboardActions } from "./dashboard-actions";
import { isTeacherRole } from "@/lib/constants";

export default async function DashboardPage() {
  const user = await requireUser();
  const classrooms = await getUserClassrooms(user.id);
  const isTeacher = user.role === "TEACHER";
  const todoCount = isTeacher ? 0 : await getTodoCount(user.id);
  const pet = isTeacher ? null : await getPetState(user.id);

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
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link href="/todo" className="block">
              <Card className="flex h-full items-center gap-4 p-5 transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <ListChecks className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-gray-900">My To-do</h2>
                  <p className="text-sm text-gray-500">
                    {todoCount === 0
                      ? "You're all caught up. Nothing to turn in."
                      : `You have ${todoCount} thing${
                          todoCount === 1 ? "" : "s"
                        } to turn in. One at a time.`}
                  </p>
                </div>
                {todoCount > 0 && (
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-600 px-2 text-sm font-bold text-white">
                    {todoCount}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
              </Card>
            </Link>

            {pet && (
              <Link href="/pet" className="block">
                <Card className="flex h-full items-center gap-4 p-5 transition-shadow hover:shadow-md">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                    <PetAvatar
                      species={pet.species}
                      color={pet.color}
                      level={pet.progress.stage.level}
                      size={52}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-gray-900">My Buddy</h2>
                    <p className="text-sm text-gray-500">
                      {pet.name} is a Level {pet.progress.stage.level}{" "}
                      {pet.progress.stage.name} Buddy.
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
                </Card>
              </Link>
            )}
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
