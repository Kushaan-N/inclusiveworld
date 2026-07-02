import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getClassroomContext } from "@/lib/queries";
import { toEmbedUrl } from "@/lib/embed";
import { LessonViewer } from "./lesson-viewer";

export default async function LessonViewerPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  const { classroom, user, isTeacher } = await getClassroomContext(id);

  const lessons = await prisma.lesson.findMany({
    where: { classroomId: id },
    orderBy: { order: "asc" },
    include: { progress: { where: { userId: user.id } } },
  });

  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();
  const lesson = lessons[index];

  // Student side panel: assignments + quizzes with the student's status.
  const [assignments, quizzes] = await Promise.all([
    prisma.assignment.findMany({
      where: { classroomId: id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { submissions: { where: { userId: user.id } } },
    }),
    prisma.quiz.findMany({
      where: { classroomId: id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { attempts: { where: { userId: user.id } } },
    }),
  ]);

  return (
    <LessonViewer
      classroom={{
        id: classroom.id,
        name: classroom.name,
        emoji: classroom.emoji,
        color: classroom.color,
      }}
      user={{ id: user.id, name: user.name, role: user.role, avatarUrl: user.avatarUrl }}
      isTeacher={isTeacher}
      lesson={{
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        embedUrl: toEmbedUrl(lesson.slidesUrl),
        completed: lesson.progress[0]?.completed ?? false,
      }}
      lessonList={lessons.map((l, i) => ({
        id: l.id,
        number: i + 1,
        title: l.title,
        completed: l.progress[0]?.completed ?? false,
        current: l.id === lessonId,
      }))}
      prevId={index > 0 ? lessons[index - 1].id : null}
      nextId={index < lessons.length - 1 ? lessons[index + 1].id : null}
      assignments={assignments.map((a) => ({
        id: a.id,
        title: a.title,
        dueDate: a.dueDate ? a.dueDate.toISOString() : null,
        submitted: a.submissions.length > 0,
      }))}
      quizzes={quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        questionCount: (JSON.parse(q.questions) as unknown[]).length,
        completed: q.attempts.length > 0,
      }))}
    />
  );
}
