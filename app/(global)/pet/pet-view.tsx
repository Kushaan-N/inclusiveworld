"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  BookOpen,
  CheckSquare,
  FileText,
  HelpCircle,
  Check,
  ClipboardCheck,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { PetAvatar } from "@/components/pet/pet-avatar";
import { Card, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PET_SPECIES,
  PET_COLORS,
  XP,
  type PetSpecies,
} from "@/lib/pet";
import { gradeReward, letterGradeDisplay } from "@/lib/grades";
import type { PetState, PracticeSuggestion } from "@/lib/queries";
import { updatePet } from "@/lib/actions/preferences";

export function PetView({ pet }: { pet: PetState }) {
  const [species, setSpecies] = useState<PetSpecies>(pet.species);
  const [color, setColor] = useState(pet.color);
  const [name, setName] = useState(pet.name);
  const [savedName, setSavedName] = useState(pet.name);
  const [, startTransition] = useTransition();

  const { progress, counts, encouragement, scores } = pet;
  const { stage, isMaxed, toNext, xp, nextStageXp } = progress;
  const standing =
    scores.overallAverage != null ? gradeReward(scores.overallAverage) : null;

  function save(next: Partial<{ species: PetSpecies; color: string; name: string }>) {
    startTransition(async () => {
      await updatePet(next);
    });
  }

  function pickSpecies(s: PetSpecies) {
    setSpecies(s);
    save({ species: s });
  }
  function pickColor(c: string) {
    setColor(c);
    save({ color: c });
  }
  function commitName() {
    const trimmed = name.trim() || "Buddy";
    setName(trimmed);
    if (trimmed !== savedName) {
      setSavedName(trimmed);
      save({ name: trimmed });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Buddy</h1>
        <p className="mt-1 text-gray-500">
          {encouragement
            ? `${savedName} noticed a dip in ${encouragement.className} — here's how they're cheering you on.`
            : `${savedName} grows from your work and keeps an eye on your scores. Keep going!`}
        </p>
      </div>

      {/* Always-on link to /scores, so the buddy↔grades connection is visible
          even when nothing's dipped (the encouragement card below only shows
          on a dip). */}
      {standing && (
        <Link href="/scores" className="block">
          <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
            <span className="text-3xl shrink-0" aria-hidden>
              {standing.symbol}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900">How you&apos;re doing</p>
              <p className="text-sm text-gray-600">
                Your average is{" "}
                <span className="font-semibold text-brand-600">
                  {scores.overallAverage}% ({letterGradeDisplay(scores.overallAverage!)})
                </span>{" "}
                across all classes. {savedName} is cheering you on!
              </p>
            </div>
            <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 sm:flex">
              See My Scores
              <ChevronRight className="h-4 w-4" />
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 sm:hidden" />
          </Card>
        </Link>
      )}

      {/* Buddy + progress */}
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-4 bg-brand-50/50 px-6 py-8">
          <PetAvatar
            species={species}
            color={color}
            level={stage.level}
            size={180}
          />
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{savedName}</p>
            <p className="text-sm font-semibold text-brand-600">
              Level {stage.level} · {stage.name} Buddy
            </p>
          </div>

          {encouragement && (
            <p className="max-w-sm rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 shadow-sm">
              &ldquo;{encouragement.message}&rdquo;
            </p>
          )}
        </div>

        <div className="px-6 py-5">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700">
              {xp} points earned
            </span>
            <span className="text-gray-400">
              {isMaxed ? "All grown up! 🎉" : `Next level at ${nextStageXp}`}
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${Math.round(toNext * 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Practice suggestions, only when My Buddy has noticed a dip — always
          framed as an invitation, never a requirement (see lib/grades.ts:
          no shaming anywhere in this system). */}
      {encouragement && encouragement.suggestions.length > 0 && (
        <Card className="p-5">
          <h2 className="font-bold text-gray-900">Want more practice?</h2>
          <p className="text-sm text-gray-500">
            No pressure — pick one whenever you&apos;re ready.
          </p>
          <ul className="mt-4 space-y-3">
            {encouragement.suggestions.map((s) => (
              <PracticeRow key={`${s.kind}-${s.title}`} suggestion={s} />
            ))}
          </ul>
        </Card>
      )}

      {/* How to earn */}
      <Card className="p-5">
        <h2 className="font-bold text-gray-900">How {savedName} grows</h2>
        <p className="text-sm text-gray-500">
          You earn points just by doing your work. No rush!
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <EarnRow
            icon={<CheckSquare className="h-5 w-5" />}
            label="Finish a lesson step"
            points={XP.step}
            count={counts.steps}
          />
          <EarnRow
            icon={<BookOpen className="h-5 w-5" />}
            label="Complete a lesson"
            points={XP.lesson}
            count={counts.lessons}
          />
          <EarnRow
            icon={<FileText className="h-5 w-5" />}
            label="Turn in an assignment"
            points={XP.assignment}
            count={counts.assignments}
          />
          <EarnRow
            icon={<HelpCircle className="h-5 w-5" />}
            label="Take a quiz"
            points={XP.quiz}
            count={counts.quizzes}
          />
        </ul>
      </Card>

      {/* Customize */}
      <Card className="p-5">
        <h2 className="font-bold text-gray-900">Make {savedName} yours</h2>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">Pick a buddy</p>
          <div className="flex flex-wrap gap-2">
            {PET_SPECIES.map((s) => (
              <button
                key={s.id}
                onClick={() => pickSpecies(s.id)}
                aria-pressed={species === s.id}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  species === s.id
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-600 hover:border-brand-200"
                )}
              >
                <span className="text-lg" aria-hidden>
                  {s.emoji}
                </span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">Pick a color</p>
          <div className="flex flex-wrap gap-3">
            {PET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => pickColor(c)}
                aria-label={`Color ${c}`}
                aria-pressed={color === c}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-transform hover:scale-105",
                  color === c ? "border-gray-800" : "border-white shadow"
                )}
                style={{ backgroundColor: c }}
              >
                {color === c && <Check className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 max-w-xs">
          <p className="mb-2 text-sm font-semibold text-gray-700">
            Give it a name
          </p>
          <div className="flex gap-2">
            <Input
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              placeholder="Buddy"
            />
            <Button variant="outline" onClick={commitName}>
              Save
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PracticeRow({ suggestion }: { suggestion: PracticeSuggestion }) {
  const Icon = suggestion.kind === "quiz" ? ClipboardCheck : BookOpen;
  return (
    <li className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{suggestion.title}</p>
        <p className="text-xs text-gray-500">
          {suggestion.className}
          {suggestion.minutes != null && <> · {suggestion.minutes} min</>}
        </p>
      </div>
      <Link
        href={suggestion.href}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-brand-600 bg-white px-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
      >
        Start <ArrowRight className="h-4 w-4" />
      </Link>
    </li>
  );
}

function EarnRow({
  icon,
  label,
  points,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  points: number;
  count: number;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">
          +{points} points · done {count} time{count === 1 ? "" : "s"}
        </p>
      </div>
    </li>
  );
}
