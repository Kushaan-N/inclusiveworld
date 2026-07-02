import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { isTeacherRole } from "@/lib/constants";

/**
 * Loads a classroom and the current user's ACTIVE membership in it.
 * Redirects to /login if signed out; 404s if the class doesn't exist or the
 * user isn't a member.
 */
export async function getClassroomContext(classroomId: string) {
  const user = await requireUser();

  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
  });
  if (!classroom) notFound();

  const membership = await prisma.membership.findFirst({
    where: { classroomId, userId: user.id, status: "ACTIVE" },
  });
  if (!membership) notFound();

  return {
    user,
    classroom,
    membership,
    isTeacher: isTeacherRole(membership.roleInClass),
  };
}

/** Same as getClassroomContext but requires a teacher/admin role. */
export async function requireTeacherContext(classroomId: string) {
  const ctx = await getClassroomContext(classroomId);
  if (!ctx.isTeacher) redirect(`/classroom/${classroomId}/lessons`);
  return ctx;
}

/** All classrooms the user is an active member of, with quick stats. */
export async function getUserClassrooms(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      classroom: {
        include: {
          _count: {
            select: { memberships: true, lessons: true, assignments: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return memberships.map((m) => ({
    ...m.classroom,
    roleInClass: m.roleInClass,
  }));
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}
