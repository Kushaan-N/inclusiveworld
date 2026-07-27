import { redirect } from "next/navigation";
import { FileText, ClipboardCheck, NotebookPen } from "lucide-react";
import { getClassroomContext, getClassGradebook, type GradebookColumn, type GradebookCell } from "@/lib/queries";
import { gradeReward, letterGradeDisplay } from "@/lib/grades";
import { ClassHeader } from "@/components/layout/class-header";
import { Card, Avatar, EmptyState } from "@/components/ui/primitives";

export default async function GradesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Teacher-only — the mirror of a student's personal /scores page.
  const { classroom, isTeacher } = await getClassroomContext(id);
  if (!isTeacher) redirect(`/classroom/${id}/lessons`);

  const gradebook = await getClassGradebook(id);
  const { columns, classAverage, studentCount } = gradebook;
  const overall = classAverage != null ? gradeReward(classAverage) : null;

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <ClassHeader
        emoji={classroom.emoji}
        color={classroom.color}
        name={classroom.name}
        subtitle="Grades"
      />

      {/* Class-level summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Students" value={String(studentCount)} />
        <SummaryCard label="Graded items" value={String(columns.length)} />
        <SummaryCard
          label="Class average"
          value={overall ? `${classAverage}%` : "—"}
          badge={
            overall ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold text-white"
                role="img"
                aria-label={`Class average grade ${overall.letter}, ${classAverage} percent`}
              >
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${overall.badgeClass}`}>
                  <span aria-hidden>{overall.symbol}</span>
                  {overall.letter}
                </span>
              </span>
            ) : null
          }
        />
      </div>

      <div className="mt-6">
        {studentCount === 0 ? (
          <EmptyState
            icon={<NotebookPen className="h-7 w-7" />}
            title="No students yet"
            description="Once students join with your class code, their grades will show up here."
          />
        ) : columns.length === 0 ? (
          <EmptyState
            icon={<NotebookPen className="h-7 w-7" />}
            title="Nothing to grade yet"
            description="Create an assignment or quiz, and each student's scores will appear in this gradebook."
          />
        ) : (
          <Gradebook gradebook={gradebook} />
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {badge}
      </div>
    </Card>
  );
}

function Gradebook({ gradebook }: { gradebook: Awaited<ReturnType<typeof getClassGradebook>> }) {
  const { columns, students } = gradebook;

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="sticky left-0 z-10 bg-white px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                Student
              </th>
              {columns.map((col) => (
                <ColumnHeader key={col.id} col={col} />
              ))}
              <th className="bg-brand-50/40 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-brand-700">
                Average
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((s) => {
              const reward = s.average != null ? gradeReward(s.average) : null;
              return (
                <tr key={s.id} className="hover:bg-gray-50/60">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} src={s.avatarUrl} size={32} />
                      <span className="whitespace-nowrap font-semibold text-gray-900">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  {columns.map((col) => (
                    <ScoreCell key={col.id} cell={s.cells[col.id]} />
                  ))}
                  <td className="bg-brand-50/40 px-4 py-3 text-center">
                    {reward ? (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold ${reward.badgeClass}`}
                        role="img"
                        aria-label={`${s.name}: grade ${letterGradeDisplay(s.average!)}, ${s.average} percent`}
                      >
                        <span aria-hidden>{reward.symbol}</span>
                        {letterGradeDisplay(s.average!)} · {s.average}%
                      </span>
                    ) : (
                      <span className="text-gray-300" aria-label="no grades yet">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-100 bg-gray-50/60">
              <td className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Class avg
              </td>
              {columns.map((col) => (
                <td key={col.id} className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                  {col.classAverage != null ? `${col.classAverage}%` : "—"}
                </td>
              ))}
              <td className="bg-brand-50/40 px-4 py-3 text-center text-sm font-bold text-brand-700">
                {gradebook.classAverage != null ? `${gradebook.classAverage}%` : "—"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}

function ColumnHeader({ col }: { col: GradebookColumn }) {
  const Icon = col.kind === "quiz" ? ClipboardCheck : FileText;
  return (
    <th className="px-3 py-3 align-bottom">
      <div className="flex w-28 flex-col gap-1">
        <span className="flex items-center gap-1.5 text-gray-400">
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            {col.kind}
          </span>
        </span>
        <span className="line-clamp-2 text-xs font-semibold text-gray-900" title={col.title}>
          {col.title}
        </span>
        {col.points != null && (
          <span className="text-[10px] text-gray-400">out of {col.points}</span>
        )}
      </div>
    </th>
  );
}

function ScoreCell({ cell }: { cell: GradebookCell }) {
  if (cell.score == null) {
    return (
      <td className="px-3 py-3 text-center">
        <span className="text-gray-300" aria-label="not submitted">—</span>
      </td>
    );
  }
  const reward = gradeReward(cell.score);
  return (
    <td className="px-3 py-3 text-center">
      <span
        className={`inline-block rounded-lg px-2 py-1 text-xs font-bold text-gray-900 ${reward.washClass}`}
        role="img"
        aria-label={`grade ${reward.letter}, ${cell.display}`}
      >
        {cell.display}
      </span>
    </td>
  );
}
