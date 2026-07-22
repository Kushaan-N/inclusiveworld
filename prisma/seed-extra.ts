/**
 * ADDITIVE test-data seed — creates a second demo student (Jordan Lee) enrolled
 * in the existing demo classes, with a distinct grade profile from Alex.
 *
 * Unlike prisma/seed.ts, this NEVER deletes other data. It only removes and
 * recreates Jordan's own records, so it's safe to re-run and safe to run
 * against a database that already has real/demo data in it.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const daysAgo = (n: number) => new Date(Date.now() - 1000 * 60 * 60 * 24 * n);

async function main() {
  console.log("🌱 Adding demo student Jordan Lee...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // Idempotent: wipe any prior Jordan (cascades to memberships/submissions/
  // attempts/progress) before recreating.
  await prisma.user.deleteMany({ where: { email: "jordan@inclusiveworld.org" } });

  const jordan = await prisma.user.create({
    data: {
      name: "Jordan Lee",
      email: "jordan@inclusiveworld.org",
      passwordHash,
      role: "STUDENT",
      petSpecies: "bear",
      petName: "Rocky",
      petColor: "#63c7a6",
      lastLogin: new Date(),
    },
  });

  // Enroll in the three existing demo classes (by their join codes from seed.ts).
  const codes = ["PYTHN234", "ALGB5678", "WRITE9012"];
  const classes = await prisma.classroom.findMany({ where: { joinCode: { in: codes } } });
  const byCode = new Map(classes.map((c) => [c.joinCode, c]));
  for (const code of codes) {
    const c = byCode.get(code);
    if (!c) {
      console.warn(`  ! class ${code} not found — run the main seed first. Skipping.`);
      continue;
    }
    await prisma.membership.create({
      data: {
        userId: jordan.id,
        classroomId: c.id,
        roleInClass: "STUDENT",
        status: "ACTIVE",
        lastActiveAt: new Date(),
      },
    });
  }

  // Helpers to attach Jordan's work to EXISTING assignments/quizzes by title.
  async function gradeAssignment(code: string, title: string, grade: number, when: Date, feedback?: string) {
    const c = byCode.get(code);
    if (!c) return;
    const a = await prisma.assignment.findFirst({ where: { classroomId: c.id, title } });
    if (!a) { console.warn(`  ! assignment "${title}" not found in ${code}`); return; }
    await prisma.submission.create({
      data: {
        assignmentId: a.id,
        userId: jordan.id,
        linkUrl: "https://docs.google.com/document/d/demo-jordan",
        grade,
        feedback: feedback ?? null,
        submittedAt: when,
      },
    });
  }
  async function takeQuiz(code: string, title: string, score: number, when: Date) {
    const c = byCode.get(code);
    if (!c) return;
    const q = await prisma.quiz.findFirst({ where: { classroomId: c.id, title } });
    if (!q) { console.warn(`  ! quiz "${title}" not found in ${code}`); return; }
    await prisma.quizAttempt.create({
      data: { quizId: q.id, userId: jordan.id, answers: "[]", score, completedAt: when },
    });
  }

  // Strong, steadily-improving profile — every item at B or above (streak
  // trophy), a perfect score, and no dips (so My Buddy stays in its happy
  // "keep going" state rather than the encouragement state Alex triggers).
  await takeQuiz("PYTHN234", "Variables & Data Types Quiz", 90, daysAgo(12));
  await gradeAssignment("PYTHN234", "Function Practice", 92, daysAgo(6), "Clean, well-named functions — great work!");
  await takeQuiz("PYTHN234", "Quiz 2: Functions", 96, daysAgo(2));

  await gradeAssignment("ALGB5678", "Slope Basics", 88, daysAgo(9), "Solid — watch your sign on step 3.");
  await takeQuiz("ALGB5678", "Linear Equations Quiz", 94, daysAgo(1));

  await gradeAssignment("WRITE9012", "Poem Response", 92, daysAgo(14), "Vivid imagery — lovely response.");
  await takeQuiz("WRITE9012", "Grammar Basics Quiz", 100, daysAgo(3));

  // Some completed Python lessons + steps, so Rocky has real XP (Level 4).
  const python = byCode.get("PYTHN234");
  if (python) {
    const lessons = await prisma.lesson.findMany({
      where: { classroomId: python.id },
      orderBy: { order: "asc" },
      include: { steps: true },
      take: 4,
    });
    for (let i = 0; i < lessons.length; i++) {
      await prisma.lessonProgress.create({
        data: { lessonId: lessons[i].id, userId: jordan.id, completed: true, completedAt: daysAgo(15 - i * 2) },
      });
      // Mark this lesson's steps done too.
      for (const step of lessons[i].steps) {
        await prisma.lessonStepProgress.create({
          data: { stepId: step.id, userId: jordan.id, done: true, doneAt: daysAgo(15 - i * 2) },
        });
      }
    }
  }

  const [subs, attempts, lessonsDone, stepsDone] = await Promise.all([
    prisma.submission.count({ where: { userId: jordan.id } }),
    prisma.quizAttempt.count({ where: { userId: jordan.id } }),
    prisma.lessonProgress.count({ where: { userId: jordan.id, completed: true } }),
    prisma.lessonStepProgress.count({ where: { userId: jordan.id, done: true } }),
  ]);

  console.log("✅ Jordan Lee added.");
  console.log(`   ${subs} submissions, ${attempts} quiz attempts, ${lessonsDone} lessons, ${stepsDone} steps.`);
  console.log("   Login: jordan@inclusiveworld.org / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
