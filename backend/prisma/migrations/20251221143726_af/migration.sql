/*
  Warnings:

  - You are about to drop the column `duration` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Course` DROP COLUMN `duration`;

-- AlterTable
ALTER TABLE `Lesson` ADD COLUMN `duration` INTEGER NULL DEFAULT 0;
