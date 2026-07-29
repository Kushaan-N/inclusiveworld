import { redirect } from "next/navigation";
import { GraduationCap, FileText, ClipboardCheck } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { getScoresData, getPetState, type ScoreItem, type ClassScores } from "@/lib/queries";
import { gradeReward, letterGradeDisplay, GRADE_LEGEND } from "@/lib/grades";
import { Card, Badge, EmptyState } from "@/components/ui/primitives";
import { ReadAloud } from "@/components/ui/read-aloud";
import { TrendPill } from "@/components/scores/trend-pill";
import { TrophyShelf } from "@/components/scores/trophy-shelf";
import { BuddyScoresNote } from "@/components/pet/buddy-scores-note";
import { formatDate } from "@/lib/utils";

export default async function ScoresPage() {
  const user = await requireUser();
  // Grades are a personal record for the student; teachers grade from each
  // classroom's Assignments/Quizzes tabs instead (see GradeRow there).
  if (user.role === "TEACHER") redirect("/dashboard");

  const [scores, pet] = await Promise.all([
    getScoresData(user.id),
    getPetState(user.id),
  ]);
  const overall = scores.overallAverage != null ? gradeReward(scores.overallAverage) : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Scores</h1>
            <p className="mt-1 text-gray-500">
              Every graded assignment and quiz, across all of your classes.
            </p>
          </div>
          {overall && (
            <ReadAloud text={summaryText(scores.overallAverage!, scores.gradedCount, overall.label, scores.classes)} label="Read my scores to me" />
          )}
        </div>

        {scores.gradedCount === 0 || !overall ? (
          <div className="mt-8">
            <EmptyState
              icon={<GraduationCap className="h-7 w-7" />}
              title="Nothing graded yet"
              description="Once your teacher grades an assignment, or you take a quiz, your scores will show up here."
            />
          </div>
        ) : (
          <>
            <Card className={`mt-8 p-6 ${overall.washClass}`}>
              <div
                className="flex items-center gap-4"
                role="img"
                aria-label={`${overall.label}, grade ${letterGradeDisplay(scores.overallAverage!)}, ${scores.overallAverage} percent${scores.overallTrend ? `, trend ${scores.overallTrend.direction === "flat" ? "steady" : `${scores.overallTrend.direction} ${Math.abs(scores.overallTrend.delta)} points`}` : ""}`}
              >
                <span className="text-6xl shrink-0" aria-hidden>
                  {overall.symbol}
                </span>
                <div aria-hidden>
                  <p className="text-2xl font-bold text-gray-900">
                    {overall.label} — {letterGradeDisplay(scores.overallAverage!)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Cumulative average across all classes
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-4xl font-bold text-brand-600">
                      {scores.overallAverage}%
                    </span>
                    {scores.overallTrend && (
                      <TrendPill trend={scores.overallTrend} hidden />
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Across {scores.gradedCount} graded item
                {scores.gradedCount === 1 ? "" : "s"}
              </p>

              {scores.trophies.length > 0 && (
                <div className="mt-4 border-t border-black/5 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Trophy shelf
                  </p>
                  <TrophyShelf trophies={scores.trophies} />
                </div>
              )}
            </Card>

            <BuddyScoresNote pet={pet} />

            <div className="mt-8 space-y-8">
              {scores.classes.map((c) => {
                const classReward = gradeReward(c.average);
                return (
                  <div key={c.classroomId}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <span aria-hidden>{c.classEmoji}</span>
                        {c.className}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span
                          className="flex items-center gap-1.5 text-sm font-semibold text-brand-600"
                          role="img"
                          aria-label={`Class average: grade ${classReward.letter}, ${c.average} percent`}
                        >
                          <span aria-hidden>{classReward.symbol}</span>
                          <span aria-hidden>
                            {classReward.letter} average ({c.average}%)
                          </span>
                        </span>
                        <TrendPill trend={c.trend} />
                      </div>
                    </div>
                    <div className="mt-3 space-y-3">
                      {c.items.map((item) => (
                        <ScoreRow key={`${item.kind}-${item.id}`} item={item} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <GradeLegend />
          </>
        )}
      </div>
  );
}

/** A short, natural-language narration for the "Read my scores to me" button. */
function summaryText(
  overallAverage: number,
  gradedCount: number,
  overallLabel: string,
  classes: ClassScores[]
): string {
  const parts = [
    `You have an overall average of ${overallAverage} percent, across ${gradedCount} graded item${gradedCount === 1 ? "" : "s"}. ${overallLabel}`,
  ];
  for (const c of classes) {
    const r = gradeReward(c.average);
    const trendPhrase =
      c.trend.direction === "flat"
        ? "about the same as before"
        : `${c.trend.direction} ${Math.abs(c.trend.delta)} points from before`;
    parts.push(
      `In ${c.className}, your average is ${c.average} percent, that's a ${r.letter}, ${trendPhrase}.`
    );
  }
  return parts.join(" ");
}

function GradeLegend() {
  return (
    <Card className="mt-8 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        What the symbols mean
      </p>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
        {GRADE_LEGEND.map((g) => (
          <div key={g.letter} className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              {g.symbol}
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">{g.letter}</p>
              <p className="text-xs text-gray-500">{g.label}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ScoreRow({ item }: { item: ScoreItem }) {
  const Icon = item.kind === "quiz" ? ClipboardCheck : FileText;
  const reward = gradeReward(item.score);
  const gradeDescription = `Grade ${reward.letter}, ${reward.label}, ${item.raw}`;

  return (
    <Card className={`border-l-4 p-4 ${reward.accentClass}`}>
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-gray-900">{item.title}</h3>
          <p className="text-xs text-gray-400">{formatDate(item.gradedAt)}</p>
        </div>
        <div
          className="flex shrink-0 items-center gap-2"
          role="img"
          aria-label={gradeDescription}
        >
          <span className="text-3xl" aria-hidden>
            {reward.symbol}
          </span>
          <Badge className={reward.badgeClass} aria-hidden>
            {reward.letter} · {item.raw}
          </Badge>
        </div>
      </div>

      {item.feedback && (
        <div className="mt-3 flex items-start gap-3 rounded-xl bg-surface-pinklite p-3">
          <p className="flex-1 text-sm text-gray-700">
            <span className="font-semibold text-gray-500">Teacher note: </span>
            {item.feedback}
          </p>
          <ReadAloud
            text={item.feedback}
            label="Read"
            className="shrink-0 px-2.5 py-1 text-xs"
          />
        </div>
      )}
    </Card>
  );
}
