-- DropForeignKey
ALTER TABLE "ProjectTeam" DROP CONSTRAINT "ProjectTeam_teamId_fkey";

-- AlterTable
ALTER TABLE "ProjectTeam" ALTER COLUMN "teamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectTeam" ADD CONSTRAINT "ProjectTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
