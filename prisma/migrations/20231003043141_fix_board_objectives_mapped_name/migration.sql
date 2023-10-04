/*
  Warnings:

  - You are about to drop the `BoardObjectives` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BoardPlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BoardObjectives" DROP CONSTRAINT "BoardObjectives_boardId_fkey";

-- DropForeignKey
ALTER TABLE "BoardObjectives" DROP CONSTRAINT "BoardObjectives_claimedByPlayerId_boardId_fkey";

-- DropForeignKey
ALTER TABLE "BoardObjectives" DROP CONSTRAINT "BoardObjectives_objectiveId_fkey";

-- DropForeignKey
ALTER TABLE "BoardPlayer" DROP CONSTRAINT "BoardPlayer_boardId_fkey";

-- DropForeignKey
ALTER TABLE "BoardPlayer" DROP CONSTRAINT "BoardPlayer_userId_fkey";

-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "seed" SET DEFAULT RANDOM()*(100000000 - 2) + 2;

-- DropTable
DROP TABLE "BoardObjectives";

-- DropTable
DROP TABLE "BoardPlayer";

-- CreateTable
CREATE TABLE "boardPlayers" (
    "userId" INTEGER NOT NULL,
    "boardId" TEXT NOT NULL,

    CONSTRAINT "boardPlayers_pkey" PRIMARY KEY ("userId","boardId")
);

-- CreateTable
CREATE TABLE "boardObjectives" (
    "cellX" INTEGER NOT NULL,
    "cellY" INTEGER NOT NULL,
    "claimedRealTime" TIMESTAMP(3),
    "boardId" TEXT NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "claimedByPlayerId" INTEGER,

    CONSTRAINT "boardObjectives_pkey" PRIMARY KEY ("boardId","objectiveId")
);

-- AddForeignKey
ALTER TABLE "boardPlayers" ADD CONSTRAINT "boardPlayers_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boardPlayers" ADD CONSTRAINT "boardPlayers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boardObjectives" ADD CONSTRAINT "boardObjectives_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boardObjectives" ADD CONSTRAINT "boardObjectives_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "objectives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boardObjectives" ADD CONSTRAINT "boardObjectives_claimedByPlayerId_boardId_fkey" FOREIGN KEY ("claimedByPlayerId", "boardId") REFERENCES "boardPlayers"("userId", "boardId") ON DELETE RESTRICT ON UPDATE CASCADE;
