-- AlterTable
ALTER TABLE "boardPlayers" ALTER COLUMN "socketId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "seed" SET DEFAULT RANDOM()*(100000000 - 2) + 2;
