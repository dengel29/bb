-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "seed" DROP NOT NULL,
ALTER COLUMN "seed" SET DEFAULT RANDOM()*(15 - 5) + 5;
