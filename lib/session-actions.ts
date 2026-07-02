"use server";

import { signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function doSignOut() {
  await signOut({ redirectTo: "/login" });
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/", "layout");
}
