/*
  Warnings:

  - Added the required column `userId` to the `ProjectTeam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectTeam" ADD COLUMN     "userId" INTEGER NOT NULL;
