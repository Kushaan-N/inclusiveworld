"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getClassroomContext, requireTeacherContext } from "@/lib/queries";

export type Result = { ok: boolean; error?: string };

export async function createAssignment(
  classroomId: string,
  formData: FormData
): Promise<Result> {
  await requireTeacherContext(classroomId);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const uploadedUrl = String(formData.get("fileUrl") ?? "").trim();
  const linkUrl = String(formData.get("slidesUrl") ?? "").trim();
  const slidesUrl = uploadedUrl || linkUrl || null;
  const points = Number(formData.get("points") ?? 100) || 100;
  const dueRaw = String(formData.get("dueDate") ?? "").trim();
  const dueDate = dueRaw ? new Date(dueRaw) : null;

  if (!title) return { ok: false, error: "Please give the assignment a title." };

  const assignment = await prisma.assignment.create({
    data: { classroomId, title, description, slidesUrl, points, dueDate },
  });

  // Notify all active students in the class.
  const students = await prisma.membership.findMany({
    where: { classroomId, roleInClass: "STUDENT", status: "ACTIVE", userId: { not: null } },
    select: { userId: true },
  });
  await prisma.notification.createMany({
    data: students.map((s) => ({
      userId: s.userId as string,
      type: "assignment",
      message: `New assignment: "${title}".`,
      link: `/classroom/${classroomId}/assignments`,
    })),
  });

  revalidatePath(`/classroom/${classroomId}/assignments`);
  return { ok: !!assignment };
}

export async function deleteAssignment(
  classroomId: string,
  assignmentId: string
): Promise<Result> {
  await requireTeacherContext(classroomId);
  await prisma.assignment.delete({ where: { id: assignmentId } });
  revalidatePath(`/classroom/${classroomId}/assignments`);
  return { ok: true };
}

export async function submitAssignment(
  classroomId: string,
  assignmentId: string,
  formData: FormData
): Promise<Result> {
  const { user } = await getClassroomContext(classroomId);
  const uploadedUrl = String(formData.get("fileUrl") ?? "").trim();
  const linkUrl = uploadedUrl || String(formData.get("linkUrl") ?? "").trim() || null;
  const text = String(formData.get("text") ?? "").trim() || null;

  if (!linkUrl && !text) {
    return { ok: false, error: "Add a link, file, or some text to submit." };
  }

  await prisma.submission.upsert({
    where: { assignmentId_userId: { assignmentId, userId: user.id } },
    create: { assignmentId, userId: user.id, linkUrl, text, submittedAt: new Date() },
    update: { linkUrl, text, submittedAt: new Date(), grade: null, feedback: null },
  });

  revalidatePath(`/classroom/${classroomId}/assignments`);
  return { ok: true };
}

export async function gradeSubmission(
  classroomId: string,
  submissionId: string,
  formData: FormData
): Promise<Result> {
  await requireTeacherContext(classroomId);
  const grade = Number(formData.get("grade"));
  const feedback = String(formData.get("feedback") ?? "").trim() || null;
  if (Number.isNaN(grade)) return { ok: false, error: "Enter a numeric grade." };

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: { grade, feedback },
    include: { assignment: true },
  });

  await prisma.notification.create({
    data: {
      userId: submission.userId,
      type: "grade",
      message: `Your submission for "${submission.assignment.title}" was graded: ${grade}/${submission.assignment.points}.`,
      link: `/classroom/${classroomId}/assignments`,
    },
  });

  revalidatePath(`/classroom/${classroomId}/assignments`);
  return { ok: true };
}
