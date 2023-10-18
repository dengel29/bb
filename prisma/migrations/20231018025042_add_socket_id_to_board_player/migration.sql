/*
  Warnings:

  - Added the required column `socketId` to the `boardPlayers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "boardPlayers" ADD COLUMN     "socketId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "seed" SET DEFAULT RANDOM()*(100000000 - 2) + 2;
