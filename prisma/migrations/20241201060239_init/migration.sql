/*
  Warnings:

  - The `providerAccountId` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "providerAccountId",
ADD COLUMN     "providerAccountId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_providerAccountId_key" ON "User"("provider", "providerAccountId");
