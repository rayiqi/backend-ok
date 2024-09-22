-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "authorUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
