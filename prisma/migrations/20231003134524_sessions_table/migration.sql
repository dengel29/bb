/*
  Warnings:

  - The primary key for the `sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `data` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `expire` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sess` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "seed" SET DEFAULT RANDOM()*(100000000 - 2) + 2;

-- AlterTable
DROP TABLE "sessions";

CREATE TABLE "sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "sessions" ("expire");