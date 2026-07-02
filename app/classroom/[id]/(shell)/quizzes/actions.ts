"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getClassroomContext, requireTeacherContext } from "@/lib/queries";

export type Result = { ok: boolean; error?: string; score?: number; total?: number };

type Question = { prompt: string; options: string[]; answerIndex: number };

export async function createQuiz(
  classroomId: string,
  payload: { title: string; description: string; questions: Question[] }
): Promise<Result> {
  await requireTeacherContext(classroomId);
  const title = payload.title.trim();
  if (!title) return { ok: false, error: "Please give the quiz a title." };
  const questions = payload.questions.filter(
    (q) => q.prompt.trim() && q.options.filter((o) => o.trim()).length >= 2
  );
  if (questions.length === 0) {
    return { ok: false, error: "Add at least one question with two or more options." };
  }

  await prisma.quiz.create({
    data: {
      classroomId,
      title,
      description: payload.description.trim() || null,
      questions: JSON.stringify(questions),
    },
  });

  const students = await prisma.membership.findMany({
    where: { classroomId, roleInClass: "STUDENT", status: "ACTIVE", userId: { not: null } },
    select: { userId: true },
  });
  await prisma.notification.createMany({
    data: students.map((s) => ({
      userId: s.userId as string,
      type: "quiz",
      message: `New quiz: "${title}".`,
      link: `/classroom/${classroomId}/quizzes`,
    })),
  });

  revalidatePath(`/classroom/${classroomId}/quizzes`);
  return { ok: true };
}

export async function deleteQuiz(
  classroomId: string,
  quizId: string
): Promise<Result> {
  await requireTeacherContext(classroomId);
  await prisma.quiz.delete({ where: { id: quizId } });
  revalidatePath(`/classroom/${classroomId}/quizzes`);
  return { ok: true };
}

export async function submitQuizAttempt(
  classroomId: string,
  quizId: string,
  answers: number[]
): Promise<Result> {
  const { user } = await getClassroomContext(classroomId);
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) return { ok: false, error: "Quiz not found." };

  const questions = JSON.parse(quiz.questions) as Question[];
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.answerIndex) correct++;
  });
  const score = Math.round((correct / questions.length) * 100);

  await prisma.quizAttempt.upsert({
    where: { quizId_userId: { quizId, userId: user.id } },
    create: {
      quizId,
      userId: user.id,
      answers: JSON.stringify(answers),
      score,
      completedAt: new Date(),
    },
    update: {
      answers: JSON.stringify(answers),
      score,
      completedAt: new Date(),
    },
  });

  revalidatePath(`/classroom/${classroomId}/quizzes`);
  return { ok: true, score, total: questions.length };
}
