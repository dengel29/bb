-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "seed" SET DEFAULT RANDOM()*(100000000 - 2) + 2;

-- CreateIndex
CREATE INDEX "boardPlayers_socketId_idx" ON "boardPlayers"("socketId");
