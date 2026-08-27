-- CreateTable
CREATE TABLE `FolderActivity` (
    `id` VARCHAR(191) NOT NULL,
    `folderId` VARCHAR(191) NOT NULL,
    `actorUserId` VARCHAR(191) NULL,
    `type` ENUM('LINK_ADDED', 'MEMBER_JOINED', 'MEMBER_LEFT', 'MEMBER_KICKED') NOT NULL,
    `targetName` VARCHAR(255) NULL,
    `targetUserId` VARCHAR(191) NULL,
    `actorNickname` VARCHAR(40) NOT NULL,
    `targetNickname` VARCHAR(40) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FolderActivity_folderId_createdAt_idx`(`folderId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `FolderActivity` ADD CONSTRAINT `FolderActivity_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `FolderActivity` ADD CONSTRAINT `FolderActivity_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `FolderActivity` ADD CONSTRAINT `FolderActivity_targetUserId_fkey` FOREIGN KEY (`targetUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
