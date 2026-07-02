# Inclusive World — Classroom App

A Google Classroom–style learning platform branded as **Inclusive World**
("Where Abilities Lead the Way"). Teachers create classrooms, students join with
an 8-character code, and everyone gets lessons, assignments, and quizzes.

## Features

- **Accounts & roles** — email/password auth; register as a **Teacher** or **Student**.
- **Classrooms** — teachers create classes, each with a unique **8-char join code**;
  students join by entering the code.
- **People management** — Teachers/Students tabs, roles (Administrator/Teacher/Student),
  active vs. pending-invite status, invite co-teachers by email.
- **Lessons** — attach a Google Slides / Drive link, upload a slide deck / PDF, or
  write a text lesson; students track completion with checkmarks; prev/next navigation.
- **Assignments** — create with due dates & points; students submit a link/notes;
  teachers grade and leave feedback.
- **Quizzes** — build multiple-choice quizzes; students take them and get auto-scored.
- **Notifications** — new assignments/quizzes, grades, and class joins.
- **Profiles** — edit name/avatar, see all your classes.

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (custom Inclusive World theme)
- Prisma ORM + Postgres (Neon, via the Vercel Marketplace)
- Auth.js (NextAuth v5) — credentials + bcrypt
- Vercel Blob for slide/file uploads

## Getting started

```bash
npm install
vercel env pull .env.local   # pulls DATABASE_URL, AUTH_SECRET, Blob token
npx prisma migrate deploy    # applies migrations to Postgres
npm run db:seed              # loads demo data
npm run dev                  # http://localhost:3000
```

### Demo logins (password: `password123`)

| Role          | Email                      |
| ------------- | -------------------------- |
| Teacher/Admin | teacher@inclusiveworld.org |
| Teacher       | emily@inclusiveworld.org   |
| Student       | student@inclusiveworld.org |

Demo classroom **Python Programming** join code: **`PYTHN234`**

## Deploying to Vercel

1. Provision a Postgres database (e.g. Neon via the Vercel Marketplace) — this
   sets `DATABASE_URL` in the project env.
2. Provision a Vercel Blob store for file uploads (sets `BLOB_READ_WRITE_TOKEN`).
3. Set `AUTH_SECRET` in project env vars.
4. Run `npx prisma migrate deploy` and optionally `npm run db:seed`, then deploy.

## Useful scripts

- `npm run db:seed` — reseed demo data
- `npm run db:studio` — open Prisma Studio
- `npm run db:reset` — reset the database and reseed
