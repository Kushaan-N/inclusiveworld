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
      order: (last?.order ?? -1) + 1,
    },
  });

  revalidatePath(`/classroom/${classroomId}/lessons`);
  return { ok: true, lessonId: lesson.id };
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
