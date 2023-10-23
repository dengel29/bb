-- AlterTable
ALTER TABLE "boardPlayers" ADD COLUMN     "color" TEXT;

-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "seed" SET DEFAULT RANDOM()*(100000000 - 2) + 2;
