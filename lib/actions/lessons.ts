"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getClassroomContext, requireTeacherContext } from "@/lib/queries";

export type LessonResult = { ok: boolean; error?: string; lessonId?: string };

export async function createLesson(
  classroomId: string,
  formData: FormData
): Promise<LessonResult> {
  await requireTeacherContext(classroomId);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  // An uploaded file takes precedence over a pasted link.
  const uploadedUrl = String(formData.get("fileUrl") ?? "").trim();
  const linkUrl = String(formData.get("slidesUrl") ?? "").trim();
  const slidesUrl = uploadedUrl || linkUrl || null;

  const minutesRaw = Number(formData.get("estimatedMinutes"));
  const estimatedMinutes =
    Number.isFinite(minutesRaw) && minutesRaw > 0 ? Math.round(minutesRaw) : null;

  // Steps arrive as a textarea, one step per line.
  const steps = String(formData.get("steps") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!title) return { ok: false, error: "Please give the lesson a title." };

  const last = await prisma.lesson.findFirst({
    where: { classroomId },
    orderBy: { order: "desc" },
  });

  const lesson = await prisma.lesson.create({
    data: {
      classroomId,
      title,
      description,
      slidesUrl,
      estimatedMinutes,
      order: (last?.order ?? -1) + 1,
      steps: {
        create: steps.map((text, i) => ({ text, order: i })),
      },
    },
  });

  revalidatePath(`/classroom/${classroomId}/lessons`);
  return { ok: true, lessonId: lesson.id };
}

/** Student ticks (or un-ticks) one step of a lesson checklist. */
export async function toggleLessonStep(
  classroomId: string,
  stepId: string,
  done: boolean
): Promise<LessonResult> {
  const { user } = await getClassroomContext(classroomId);

  // Make sure the step actually belongs to this classroom before writing —
  // stepId comes from the client.
  const step = await prisma.lessonStep.findUnique({
    where: { id: stepId },
    include: { lesson: { select: { classroomId: true } } },
  });
  if (!step || step.lesson.classroomId !== classroomId) {
    return { ok: false, error: "That step doesn't belong to this class." };
  }

  await prisma.lessonStepProgress.upsert({
    where: { stepId_userId: { stepId, userId: user.id } },
    create: { stepId, userId: user.id, done, doneAt: done ? new Date() : null },
    update: { done, doneAt: done ? new Date() : null },
  });

  revalidatePath(`/classroom/${classroomId}/lesson/${step.lessonId}`);
  return { ok: true };
}

export async function deleteLesson(
  classroomId: string,
  lessonId: string
): Promise<LessonResult> {
  await requireTeacherContext(classroomId);
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/classroom/${classroomId}/lessons`);
  return { ok: true };
}

export async function toggleLessonComplete(
  classroomId: string,
  lessonId: string,
  completed: boolean
): Promise<LessonResult> {
  const { user } = await getClassroomContext(classroomId);

  await prisma.lessonProgress.upsert({
    where: { lessonId_userId: { lessonId, userId: user.id } },
    create: {
      lessonId,
      userId: user.id,
      completed,
      completedAt: completed ? new Date() : null,
    },
    update: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  revalidatePath(`/classroom/${classroomId}/lessons`);
  revalidatePath(`/classroom/${classroomId}/lesson/${lessonId}`);
  return { ok: true };
}
