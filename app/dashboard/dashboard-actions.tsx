"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/primitives";
import { CLASS_THEMES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { createClassroom, joinClassroom } from "./actions";

export function DashboardActions({ isTeacher }: { isTeacher: boolean }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      {isTeacher && (
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-5 w-5" />
          Create Classroom
        </Button>
      )}
      <Button variant={isTeacher ? "outline" : "primary"} onClick={() => setJoinOpen(true)}>
        <LogIn className="h-5 w-5" />
        Join Classroom
      </Button>

      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <JoinModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}

function CreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [theme, setTheme] = useState(CLASS_THEMES[0]);

  function onSubmit(formData: FormData) {
    setError(undefined);
    formData.set("emoji", theme.emoji);
    formData.set("color", theme.color);
    startTransition(async () => {
      const res = await createClassroom(formData);
      if (res.ok && res.classroomId) {
        router.push(`/classroom/${res.classroomId}/people`);
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a classroom"
      description="Students will join using the code generated for your class."
    >
      <form action={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Classroom name</Label>
          <Input id="name" name="name" placeholder="e.g. Python Programming" required />
        </div>
        <div>
          <Label htmlFor="subject">Subject (optional)</Label>
          <Input id="subject" name="subject" placeholder="e.g. Computer Science" />
        </div>
        <div>
          <Label>Pick a theme</Label>
          <div className="flex flex-wrap gap-2">
            {CLASS_THEMES.map((t) => (
              <button
                key={t.emoji}
                type="button"
                onClick={() => setTheme(t)}
                style={{ backgroundColor: t.color }}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl text-xl ring-offset-2 transition",
                  theme.emoji === t.emoji && "ring-2 ring-brand-500"
                )}
              >
                {t.emoji}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating…" : "Create classroom"}
        </Button>
      </form>
    </Modal>
  );
}

function JoinModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function onSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const res = await joinClassroom(formData);
      if (res.ok && res.classroomId) {
        router.push(`/classroom/${res.classroomId}/lessons`);
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Join a classroom"
      description="Enter the 8-character code your teacher gave you."
    >
      <form action={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="code">Class code</Label>
          <Input
            id="code"
            name="code"
            placeholder="e.g. PYTHN234"
            maxLength={8}
            autoCapitalize="characters"
            className="text-center text-lg font-bold uppercase tracking-[0.4em]"
            required
          />
        </div>

        {error && (
          <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Joining…" : "Join classroom"}
        </Button>
      </form>
    </Modal>
  );
}
