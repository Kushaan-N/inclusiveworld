"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Card,
  Input,
  Label,
  Textarea,
  Badge,
  Avatar,
  EmptyState,
} from "@/components/ui/primitives";
import { FileUpload } from "@/components/ui/file-upload";
import { cn, formatDate } from "@/lib/utils";
import {
  createAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
} from "./actions";

type Submission = {
  id: string;
  studentName: string;
  avatarUrl: string | null;
  linkUrl: string | null;
  text: string | null;
  grade: number | null;
  feedback: string | null;
  submittedAt: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  slidesUrl: string | null;
  points: number;
  submissionCount: number;
  mySubmission: {
    id: string;
    linkUrl: string | null;
    text: string | null;
    grade: number | null;
    feedback: string | null;
  } | null;
  submissions: Submission[];
};

export function AssignmentsView({
  classroomId,
  assignments,
  isTeacher,
  autoOpen,
}: {
  classroomId: string;
  assignments: Assignment[];
  isTeacher: boolean;
  autoOpen: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(autoOpen);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Assignments</h2>
        {isTeacher && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-5 w-5" /> Create Assignment
          </Button>
        )}
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-7 w-7" />}
          title="No assignments yet"
          description={
            isTeacher
              ? "Create an assignment for your students to complete."
              : "No assignments have been posted yet."
          }
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              classroomId={classroomId}
              assignment={a}
              isTeacher={isTeacher}
            />
          ))}
        </div>
      )}

      {isTeacher && (
        <CreateAssignmentModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          classroomId={classroomId}
        />
      )}
    </div>
  );
}

function dueBadge(dueDate: string | null) {
  if (!dueDate) return null;
  const days = Math.ceil(
    (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return <Badge tone="red">Past due</Badge>;
  if (days <= 3) return <Badge tone="amber">Due in {days} day{days === 1 ? "" : "s"}</Badge>;
  return <Badge tone="gray">Due {formatDate(dueDate)}</Badge>;
}

function AssignmentCard({
  classroomId,
  assignment,
  isTeacher,
}: {
  classroomId: string;
  assignment: Assignment;
  isTeacher: boolean;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();

  const graded = assignment.mySubmission?.grade != null;
  const submitted = !!assignment.mySubmission;

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
            {dueBadge(assignment.dueDate)}
            <span className="text-xs text-gray-400">{assignment.points} pts</span>
          </div>
          {assignment.description && (
            <p className="mt-1 text-sm text-gray-500">{assignment.description}</p>
          )}
          {assignment.slidesUrl && (
            <a
              href={assignment.slidesUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
            >
              <ExternalLink className="h-4 w-4" /> Attachment
            </a>
          )}

          {/* Student status */}
          {!isTeacher && (
            <div className="mt-2">
              {graded ? (
                <Badge tone="green">
                  Graded: {assignment.mySubmission!.grade}/{assignment.points}
                </Badge>
              ) : submitted ? (
                <Badge tone="blue">Submitted</Badge>
              ) : (
                <Badge tone="gray">Not submitted</Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isTeacher && (
            <span className="text-sm text-gray-500">
              {assignment.submissionCount} submitted
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => setExpanded((v) => !v)}>
            {isTeacher ? "Submissions" : submitted ? "View / Resubmit" : "Submit"}
            <ChevronDown className={cn("h-4 w-4 transition", expanded && "rotate-180")} />
          </Button>
          {isTeacher && (
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await deleteAssignment(classroomId, assignment.id);
                  router.refresh();
                })
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-brand-50 hover:text-brand-600"
              aria-label="Delete assignment"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {isTeacher ? (
            <TeacherSubmissions
              classroomId={classroomId}
              assignment={assignment}
            />
          ) : (
            <StudentSubmitForm
              classroomId={classroomId}
              assignment={assignment}
              onDone={() => setExpanded(false)}
            />
          )}
        </div>
      )}
    </Card>
  );
}

function StudentSubmitForm({
  classroomId,
  assignment,
  onDone,
}: {
  classroomId: string;
  assignment: Assignment;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function onSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const res = await submitAssignment(classroomId, assignment.id, formData);
      if (res.ok) {
        router.refresh();
        onDone();
      } else setError(res.error ?? "Something went wrong.");
    });
  }

  return (
    <form action={onSubmit} className="space-y-3">
      {assignment.mySubmission?.feedback && (
        <div className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
          <p className="font-semibold">Teacher feedback</p>
          <p>{assignment.mySubmission.feedback}</p>
        </div>
      )}
      <div>
        <Label htmlFor={`link-${assignment.id}`}>Submission link</Label>
        <Input
          id={`link-${assignment.id}`}
          name="linkUrl"
          placeholder="https://docs.google.com/… or a Colab/Gist link"
          defaultValue={assignment.mySubmission?.linkUrl ?? ""}
        />
      </div>
      <div>
        <Label>Or upload your work</Label>
        <FileUpload name="fileUrl" label="Upload a PDF, doc, or image" />
      </div>
      <div>
        <Label htmlFor={`text-${assignment.id}`}>Notes (optional)</Label>
        <Textarea
          id={`text-${assignment.id}`}
          name="text"
          rows={2}
          defaultValue={assignment.mySubmission?.text ?? ""}
          placeholder="Anything you want your teacher to know…"
        />
      </div>
      {error && <p className="text-sm text-brand-700">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : assignment.mySubmission ? "Resubmit" : "Submit"}
      </Button>
    </form>
  );
}

function TeacherSubmissions({
  classroomId,
  assignment,
}: {
  classroomId: string;
  assignment: Assignment;
}) {
  if (assignment.submissions.length === 0) {
    return <p className="text-sm text-gray-400">No submissions yet.</p>;
  }
  return (
    <div className="space-y-3">
      {assignment.submissions.map((s) => (
        <GradeRow
          key={s.id}
          classroomId={classroomId}
          submission={s}
          points={assignment.points}
        />
      ))}
    </div>
  );
}

function GradeRow({
  classroomId,
  submission,
  points,
}: {
  classroomId: string;
  submission: Submission;
  points: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await gradeSubmission(classroomId, submission.id, formData);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <div className="flex items-center gap-2">
        <Avatar name={submission.studentName} src={submission.avatarUrl} size={32} />
        <span className="font-medium text-gray-900">{submission.studentName}</span>
        <span className="text-xs text-gray-400">
          {formatDate(submission.submittedAt)}
        </span>
        {submission.grade != null && (
          <Badge tone="green" className="ml-auto">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {submission.grade}/{points}
          </Badge>
        )}
      </div>

      {submission.linkUrl && (
        <a
          href={submission.linkUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
        >
          <ExternalLink className="h-4 w-4" /> {submission.linkUrl}
        </a>
      )}
      {submission.text && (
        <p className="mt-1 text-sm text-gray-600">{submission.text}</p>
      )}

      <form action={onSubmit} className="mt-3 flex flex-wrap items-end gap-2">
        <div className="w-24">
          <Label htmlFor={`grade-${submission.id}`}>Grade</Label>
          <Input
            id={`grade-${submission.id}`}
            name="grade"
            type="number"
            min={0}
            max={points}
            defaultValue={submission.grade ?? ""}
            placeholder={`/${points}`}
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <Label htmlFor={`fb-${submission.id}`}>Feedback</Label>
          <Input
            id={`fb-${submission.id}`}
            name="feedback"
            defaultValue={submission.feedback ?? ""}
            placeholder="Nice work!"
          />
        </div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save grade"}
        </Button>
      </form>
    </div>
  );
}

function CreateAssignmentModal({
  open,
  onClose,
  classroomId,
}: {
  open: boolean;
  onClose: () => void;
  classroomId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function onSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const res = await createAssignment(classroomId, formData);
      if (res.ok) {
        onClose();
        router.refresh();
      } else setError(res.error ?? "Something went wrong.");
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create an assignment"
      description="Students will be notified and can submit a link or notes."
    >
      <form action={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="e.g. Function Practice" required />
        </div>
        <div>
          <Label htmlFor="description">Instructions</Label>
          <Textarea id="description" name="description" rows={3} placeholder="What should students do?" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" name="dueDate" type="datetime-local" />
          </div>
          <div>
            <Label htmlFor="points">Points</Label>
            <Input id="points" name="points" type="number" min={1} defaultValue={100} />
          </div>
        </div>
        <div>
          <Label htmlFor="slidesUrl">Attachment link (optional)</Label>
          <Input id="slidesUrl" name="slidesUrl" placeholder="https://…" />
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
          <span className="h-px flex-1 bg-gray-100" /> OR upload a file{" "}
          <span className="h-px flex-1 bg-gray-100" />
        </div>
        <FileUpload name="fileUrl" label="Upload a worksheet or handout" />
        {error && (
          <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating…" : "Create assignment"}
        </Button>
      </form>
    </Modal>
  );
}
