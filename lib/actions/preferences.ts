"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { isDisplayPrefKey, isValidPrefValue } from "@/lib/preferences";
import {
  isPetSpecies,
  normalizePetName,
  normalizeColor,
  PET_COLORS,
} from "@/lib/pet";

/** Set one reading/display preference (textScale | lineSpacing | readingFont). */
export async function setDisplayPreference(
  key: string,
  value: string
): Promise<{ ok: boolean }> {
  const user = await requireUser();
  if (!isDisplayPrefKey(key) || !isValidPrefValue(key, value)) {
    return { ok: false };
  }

  await prisma.user.update({ where: { id: user.id }, data: { [key]: value } });
  // Prefs live on <html> in the root layout — refresh every route.
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Update the student's pet look and name. */
export async function updatePet(input: {
  species?: string;
  name?: string;
  color?: string;
}): Promise<{ ok: boolean }> {
  const user = await requireUser();

  const data: { petSpecies?: string; petName?: string; petColor?: string } = {};
  if (input.species !== undefined) {
    if (!isPetSpecies(input.species)) return { ok: false };
    data.petSpecies = input.species;
  }
  if (input.color !== undefined) {
    if (!PET_COLORS.includes(input.color)) return { ok: false };
    data.petColor = normalizeColor(input.color);
  }
  if (input.name !== undefined) {
    data.petName = normalizePetName(input.name);
  }

  await prisma.user.update({ where: { id: user.id }, data });
  revalidatePath("/pet");
  return { ok: true };
}
