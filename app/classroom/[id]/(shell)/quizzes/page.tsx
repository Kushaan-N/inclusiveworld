import { prisma } from "@/lib/db";
import { getClassroomContext } from "@/lib/queries";
import { ClassHeader } from "@/components/layout/class-header";
import { ActionBar } from "@/components/layout/action-bar";
import { QuizzesView } from "./quizzes-view";

type Question = { prompt: string; options: string[]; answerIndex: number };

export default async function QuizzesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const { new: newParam } = await searchParams;
  const { classroom, user, isTeacher } = await getClassroomContext(id);

  const quizzes = await prisma.quiz.findMany({
    where: { classroomId: id },
    orderBy: { createdAt: "desc" },
    include: {
      attempts: isTeacher ? true : { where: { userId: user.id } },
    },
  });

  const data = quizzes.map((q) => {
    const questions = JSON.parse(q.questions) as Question[];
    const mine = q.attempts.find((a) => a.userId === user.id) ?? null;
    return {
      id: q.id,
      title: q.title,
      description: q.description,
      // Students receive questions WITHOUT the correct answer index.
      questions: questions.map((qq) => ({
        prompt: qq.prompt,
        options: qq.options,
        ...(isTeacher ? { answerIndex: qq.answerIndex } : {}),
      })),
      questionCount: questions.length,
      attemptCount: q.attempts.length,
      myScore: mine?.score ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <ClassHeader
        emoji={classroom.emoji}
        color={classroom.color}
        name={classroom.name}
        subtitle={`${data.length} quiz${data.length === 1 ? "" : "zes"}`}
      />
      <div className="mt-6">
        <QuizzesView
          classroomId={id}
          quizzes={data}
          isTeacher={isTeacher}
          autoOpen={newParam === "1" && isTeacher}
        />
      </div>
      {isTeacher && (
        <div className="mt-8">
          <ActionBar classroomId={id} />
        </div>
      )}
    </div>
  );
}
