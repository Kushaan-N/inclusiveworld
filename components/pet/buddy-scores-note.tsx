import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PetAvatar } from "@/components/pet/pet-avatar";
import { Card } from "@/components/ui/primitives";
import type { PetState } from "@/lib/queries";

/**
 * The student's Buddy reacting to their scores, shown on the /scores page so
 * the link between grades and the pet is obvious right where grades live —
 * not only on the Buddy page, and not only when a grade dips. Tapping it goes
 * to My Buddy (straight to practice when something's dipped).
 */
export function BuddyScoresNote({ pet }: { pet: PetState }) {
  const enc = pet.encouragement;
  const message = enc
    ? `${pet.name} noticed ${enc.className} was a little tricky — there's some practice waiting whenever you're ready.`
    : `${pet.name} is proud of how you're doing! Every score you earn helps ${pet.name} grow.`;

  return (
    <Link href="/pet" className="block">
      <Card className="mt-6 flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50">
          <PetAvatar
            species={pet.species}
            color={pet.color}
            level={pet.progress.stage.level}
            size={52}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900">{pet.name} is cheering you on</p>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 sm:flex">
          {enc ? "Get practice" : "Visit My Buddy"}
          <ChevronRight className="h-4 w-4" />
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 sm:hidden" />
      </Card>
    </Link>
  );
}
