import Link from "next/link";
import { ChevronRight, ClipboardCheck, FileText, PartyPopper } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { getTodoItems, type TodoItem } from "@/lib/queries";
import { dueInfo, type DueTone } from "@/lib/due";
import { TopBar } from "@/components/layout/top-bar";
import { Logo } from "@/components/brand/logo";
import { Card, EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export default async function TodoPage() {
  const user = await requireUser();
  const items = await getTodoItems(user.id);

  return (
    <div className="min-h-screen">
      <TopBar
        user={{
          id: user.id,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }}
        left={
          <Link href="/dashboard">
            <Logo width={185} />
          </Link>
        }
      />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">My To-do</h1>
        <p className="mt-1 text-gray-500">
          Everything you still need to turn in. One at a time.
        </p>

        <div className="mt-8">
          {items.length === 0 ? (
            <EmptyState
              icon={<PartyPopper className="h-7 w-7" />}
              title="You're all caught up!"
              description="Nothing to turn in right now. Enjoy the break — new work will show up here when your teacher adds it."
            />
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <TodoRow item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const dotTones: Record<DueTone, string> = {
  overdue: "bg-brand-600",
  soon: "bg-amber-500",
  later: "bg-green-500",
  none: "bg-gray-300",
};

const chipTones: Record<DueTone, string> = {
  overdue: "bg-brand-100 text-brand-700",
  soon: "bg-amber-100 text-amber-700",
  later: "bg-green-100 text-green-700",
  none: "bg-gray-100 text-gray-500",
};

function TodoRow({ item }: { item: TodoItem }) {
  const due = dueInfo(item.dueDate);
  const Icon = item.kind === "quiz" ? ClipboardCheck : FileText;

  return (
    <Link href={item.href}>
      <Card className="flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
        <span
          className={cn("h-3 w-3 shrink-0 rounded-full", dotTones[due.tone])}
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-gray-900">
            {item.title}
          </h3>
          <p className="truncate text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Icon className="h-3.5 w-3.5" />
              {item.className}
            </span>
            {item.subtitle && <> &middot; {item.subtitle}</>}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold",
            chipTones[due.tone]
          )}
        >
          {item.kind === "quiz" && !item.dueDate ? "Quiz" : due.label}
        </span>

        <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
      </Card>
    </Link>
  );
}
