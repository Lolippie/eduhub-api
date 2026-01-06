-- CreateTable
CREATE TABLE "Quiz" (
    "courseId" TEXT NOT NULL,
    "questions" TEXT[],

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("courseId")
);

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
