"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { generateUniqueJoinCode, normalizeJoinCode } from "@/lib/join-code";

export type ActionResult = { ok: boolean; error?: string; classroomId?: string };

export async function createClassroom(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  if (user.role !== "TEACHER") {
    return { ok: false, error: "Only teachers can create classrooms." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const emoji = String(formData.get("emoji") ?? "📚");
  const color = String(formData.get("color") ?? "#c0143c");

  if (!name) return { ok: false, error: "Please give your classroom a name." };

  const joinCode = await generateUniqueJoinCode();

  const classroom = await prisma.classroom.create({
    data: {
      name,
      subject,
      emoji,
      color,
      joinCode,
      createdById: user.id,
      memberships: {
        create: {
          userId: user.id,
          roleInClass: "ADMIN",
          status: "ACTIVE",
          lastActiveAt: new Date(),
        },
      },
    },
  });

  revalidatePath("/dashboard");
  return { ok: true, classroomId: classroom.id };
}

export async function joinClassroom(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const code = normalizeJoinCode(String(formData.get("code") ?? ""));

  if (code.length !== 8) {
    return { ok: false, error: "Join codes are 8 characters long." };
  }

  const classroom = await prisma.classroom.findUnique({
    where: { joinCode: code },
  });
  if (!classroom) {
    return { ok: false, error: "No classroom found with that code." };
  }

  const existing = await prisma.membership.findFirst({
    where: { classroomId: classroom.id, userId: user.id },
  });
  if (existing) {
    if (existing.status !== "ACTIVE") {
      await prisma.membership.update({
        where: { id: existing.id },
        data: { status: "ACTIVE", lastActiveAt: new Date() },
      });
    }
    revalidatePath("/dashboard");
    return { ok: true, classroomId: classroom.id };
  }

  await prisma.membership.create({
    data: {
      userId: user.id,
      classroomId: classroom.id,
      roleInClass: user.role === "TEACHER" ? "TEACHER" : "STUDENT",
      status: "ACTIVE",
      lastActiveAt: new Date(),
    },
  });

  // Notify the classroom creator that someone joined.
  await prisma.notification.create({
    data: {
      userId: classroom.createdById,
      type: "people",
      message: `${user.name} joined "${classroom.name}".`,
      link: `/classroom/${classroom.id}/people`,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true, classroomId: classroom.id };
}
