/*
  Warnings:

  - The primary key for the `sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[sid]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "IDX_session_expire";

-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "seed" SET DEFAULT RANDOM()*(100000000 - 2) + 2;

-- AlterTable
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_pkey",
ALTER COLUMN "sid" SET DATA TYPE TEXT,
ALTER COLUMN "sess" SET DATA TYPE JSONB,
ALTER COLUMN "expire" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sid_key" ON "sessions"("sid");
