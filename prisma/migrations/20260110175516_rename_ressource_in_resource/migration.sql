/*
  Warnings:

  - You are about to drop the `Ressource` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Ressource" DROP CONSTRAINT "Ressource_courseId_fkey";

-- DropTable
DROP TABLE "public"."Ressource";

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
