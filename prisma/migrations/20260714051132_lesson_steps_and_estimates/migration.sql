-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "estimatedMinutes" INTEGER;

-- CreateTable
CREATE TABLE "LessonStep" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LessonStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonStepProgress" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),

    CONSTRAINT "LessonStepProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonStepProgress_stepId_userId_key" ON "LessonStepProgress"("stepId", "userId");

-- AddForeignKey
ALTER TABLE "LessonStep" ADD CONSTRAINT "LessonStep_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonStepProgress" ADD CONSTRAINT "LessonStepProgress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "LessonStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonStepProgress" ADD CONSTRAINT "LessonStepProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
