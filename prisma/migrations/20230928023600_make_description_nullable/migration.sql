-- DropForeignKey
ALTER TABLE "objectives" DROP CONSTRAINT "objectives_districtId_fkey";

-- AlterTable
ALTER TABLE "BoardObjectives" ALTER COLUMN "claimedRealTime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "seed" SET DEFAULT RANDOM()*(100000000 - 2) + 2;

-- AlterTable
ALTER TABLE "objectives" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "districtId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
