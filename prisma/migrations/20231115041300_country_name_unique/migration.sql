/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `countries` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "seed" SET DEFAULT RANDOM()*(100000000 - 2) + 2;

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");
