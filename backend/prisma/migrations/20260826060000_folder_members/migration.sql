-- AlterTable
ALTER TABLE `Folder` ADD COLUMN `inviteCode` VARCHAR(6) NULL;

CREATE UNIQUE INDEX `Folder_inviteCode_key` ON `Folder`(`inviteCode`);

-- CreateTable
CREATE TABLE `FolderMember` (
    `id` VARCHAR(191) NOT NULL,
    `folderId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'EDITOR') NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FolderMember_userId_idx`(`userId`),
    UNIQUE INDEX `FolderMember_folderId_userId_key`(`folderId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `FolderMember` ADD CONSTRAINT `FolderMember_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `FolderMember` ADD CONSTRAINT `FolderMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `FolderMember` (`id`, `folderId`, `userId`, `role`, `joinedAt`)
SELECT UUID(), `id`, `userId`, 'OWNER', `createdAt` FROM `Folder`;
