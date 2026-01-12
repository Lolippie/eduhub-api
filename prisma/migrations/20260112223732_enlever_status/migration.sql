/*
  Warnings:

  - You are about to drop the column `registerPin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "registerPin",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "public"."UserStatus";
