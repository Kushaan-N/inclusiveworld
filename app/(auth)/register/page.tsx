"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { GraduationCap, BookOpen } from "lucide-react";
import { registerUser } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, Input, Label } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, undefined);
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
      <p className="mt-1 text-sm text-gray-500">
        Join Inclusive World — where abilities lead the way.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="role" value={role} />

        <div>
          <Label>I am a…</Label>
          <div className="grid grid-cols-2 gap-3">
            <RoleCard
              active={role === "STUDENT"}
              onClick={() => setRole("STUDENT")}
              icon={<GraduationCap className="h-5 w-5" />}
              label="Student"
              description="Join classes & learn"
            />
            <RoleCard
              active={role === "TEACHER"}
              onClick={() => setRole("TEACHER")}
              icon={<BookOpen className="h-5 w-5" />}
              label="Teacher"
              description="Create & manage classes"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" placeholder="Jane Doe" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}

function RoleCard({
  active,
  onClick,
  icon,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-colors",
        active
          ? "border-brand-600 bg-brand-50"
          : "border-gray-200 bg-white hover:border-brand-200"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          active ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-500"
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold text-gray-900">{label}</span>
      <span className="text-xs text-gray-500">{description}</span>
    </button>
  );
}
