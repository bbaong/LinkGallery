-- AlterTable
ALTER TABLE `User` ADD COLUMN `username` VARCHAR(191) NULL;

UPDATE `User`
SET `username` = CONCAT('user', LEFT(REPLACE(`id`, '-', ''), 12))
WHERE `username` IS NULL;

ALTER TABLE `User` MODIFY `username` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

ALTER TABLE `User` MODIFY `email` VARCHAR(191) NULL;
