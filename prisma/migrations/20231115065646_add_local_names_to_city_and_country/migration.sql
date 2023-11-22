/*
  Warnings:

  - A unique constraint covering the columns `[localName]` on the table `countries` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "seed" SET DEFAULT RANDOM()*(100000000 - 2) + 2;

-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "localName" TEXT;

-- AlterTable
ALTER TABLE "countries" ADD COLUMN     "localName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "countries_localName_key" ON "countries"("localName");
