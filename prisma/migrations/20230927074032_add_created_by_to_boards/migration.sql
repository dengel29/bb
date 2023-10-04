/*
  Warnings:

  - Added the required column `createdById` to the `boards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "boards" ADD COLUMN     "createdById" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
