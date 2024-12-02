/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerAccountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerAccountId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT,
ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "providerAccountId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_providerAccountId_key" ON "User"("provider", "providerAccountId");
