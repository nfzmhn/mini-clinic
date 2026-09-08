-- AlterTable
ALTER TABLE `medical_records` ADD COLUMN `objective` TEXT NULL,
    MODIFY `subjective` TEXT NOT NULL,
    MODIFY `bp` VARCHAR(191) NULL,
    MODIFY `temp` DOUBLE NULL,
    MODIFY `weight` DOUBLE NULL,
    MODIFY `height` DOUBLE NULL,
    MODIFY `therapy` TEXT NULL;
