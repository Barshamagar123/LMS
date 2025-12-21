/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[enrollmentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Course` ADD COLUMN `duration` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `enrollmentId` INTEGER NULL,
    ADD COLUMN `paymentDetails` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX `Enrollment_userId_courseId_key` ON `Enrollment`(`userId`, `courseId`);

-- CreateIndex
CREATE UNIQUE INDEX `Payment_enrollmentId_key` ON `Payment`(`enrollmentId`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `Enrollment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
