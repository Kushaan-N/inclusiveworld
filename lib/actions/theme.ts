"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { isThemeId } from "@/lib/themes";

export async function setTheme(theme: string): Promise<{ ok: boolean }> {
  const user = await requireUser();
  if (!isThemeId(theme)) return { ok: false };

  await prisma.user.update({ where: { id: user.id }, data: { theme } });

  // The theme lives on <html> in the root layout, so refresh every route.
  revalidatePath("/", "layout");
  return { ok: true };
}
