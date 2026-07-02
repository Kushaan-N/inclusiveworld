import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Inclusive World demo data...");

  // Clear existing data (dev only)
  await prisma.notification.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const sarah = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "teacher@inclusiveworld.org",
      passwordHash,
      role: "TEACHER",
      lastLogin: new Date(),
    },
  });

  const emily = await prisma.user.create({
    data: {
      name: "Emily Chen",
      email: "emily@inclusiveworld.org",
      passwordHash,
      role: "TEACHER",
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  });

  const alex = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "student@inclusiveworld.org",
      passwordHash,
      role: "STUDENT",
      lastLogin: new Date(),
    },
  });

  const students = await Promise.all(
    [
      "Maya Patel",
      "Liam O'Brien",
      "Sofia Garcia",
      "Noah Kim",
      "Ava Thompson",
    ].map((name, i) =>
      prisma.user.create({
        data: {
          name,
          email: `${name.split(" ")[0].toLowerCase()}@inclusiveworld.org`,
          passwordHash,
          role: "STUDENT",
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * (i + 2)),
        },
      })
    )
  );

  const classroom = await prisma.classroom.create({
    data: {
      name: "Python Programming",
      subject: "Computer Science",
      emoji: "🐍",
      color: "#3b6fb0",
      joinCode: "PYTHN234",
      createdById: sarah.id,
    },
  });

  // Memberships: Sarah is Admin, Emily is a Teacher (active),
  // Michael Lee is a pending teacher invite, students are enrolled.
  await prisma.membership.create({
    data: {
      userId: sarah.id,
      classroomId: classroom.id,
      roleInClass: "ADMIN",
      status: "ACTIVE",
      lastActiveAt: new Date(),
    },
  });
  await prisma.membership.create({
    data: {
      userId: emily.id,
      classroomId: classroom.id,
      roleInClass: "TEACHER",
      status: "ACTIVE",
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  });
  await prisma.membership.create({
    data: {
      classroomId: classroom.id,
      roleInClass: "TEACHER",
      status: "PENDING_INVITE",
      invitedEmail: "michael.lee@inclusiveworld.org",
    },
  });

  const allStudents = [alex, ...students];
  await Promise.all(
    allStudents.map((s) =>
      prisma.membership.create({
        data: {
          userId: s.id,
          classroomId: classroom.id,
          roleInClass: "STUDENT",
          status: "ACTIVE",
          lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        },
      })
    )
  );

  const lessonData = [
    { title: "Introduction", description: "Welcome to Python! What it is and why it matters." },
    { title: "Variables & Data Types", description: "Storing and labeling information in Python." },
    { title: "Control Flow", description: "Making decisions with if/else and loops." },
    { title: "Functions", description: "Learn how functions work in Python, why they are useful, and how to create your own functions." },
    { title: "Lists", description: "Working with ordered collections of items." },
    { title: "Dictionaries", description: "Key–value pairs for structured data." },
    { title: "Modules", description: "Reusing and organizing code across files." },
    { title: "File Handling", description: "Reading from and writing to files." },
  ];

  const lessons = [];
  for (let i = 0; i < lessonData.length; i++) {
    const lesson = await prisma.lesson.create({
      data: {
        classroomId: classroom.id,
        title: lessonData[i].title,
        description: lessonData[i].description,
        order: i,
      },
    });
    lessons.push(lesson);
  }

  // Alex has completed the first 3 lessons (matches the screenshots).
  for (let i = 0; i < 3; i++) {
    await prisma.lessonProgress.create({
      data: {
        lessonId: lessons[i].id,
        userId: alex.id,
        completed: true,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * (72 - i * 24)),
      },
    });
  }

  const assignment = await prisma.assignment.create({
    data: {
      classroomId: classroom.id,
      title: "Function Practice",
      description:
        "Write three Python functions: greet(name), add(a, b), and is_even(n). Submit a link to your code (Google Doc, Colab, or Gist).",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      points: 100,
    },
  });

  await prisma.quiz.create({
    data: {
      classroomId: classroom.id,
      title: "Quiz 2: Functions",
      description: "Check your understanding of Python functions.",
      questions: JSON.stringify([
        {
          prompt: "Which keyword defines a function in Python?",
          options: ["func", "def", "function", "lambda"],
          answerIndex: 1,
        },
        {
          prompt: "What does a function use to send a value back to the caller?",
          options: ["print", "return", "yield", "output"],
          answerIndex: 1,
        },
        {
          prompt: "What are the values you pass into a function called?",
          options: ["arguments", "returns", "variables", "modules"],
          answerIndex: 0,
        },
      ]),
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: alex.id,
        type: "assignment",
        message: 'New assignment: "Function Practice" is due in 3 days.',
        link: `/classroom/${classroom.id}/assignments`,
      },
      {
        userId: alex.id,
        type: "lesson",
        message: 'Lesson 4 "Functions" is now available.',
        link: `/classroom/${classroom.id}/lessons`,
      },
      {
        userId: sarah.id,
        type: "people",
        message: "Michael Lee has a pending teacher invite.",
        link: `/classroom/${classroom.id}/people`,
      },
    ],
  });

  console.log("✅ Seed complete.");
  console.log("\nDemo logins (password: password123):");
  console.log("  Teacher/Admin: teacher@inclusiveworld.org");
  console.log("  Teacher:       emily@inclusiveworld.org");
  console.log("  Student:       student@inclusiveworld.org");
  console.log("\nPython Programming join code: PYTHN234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
