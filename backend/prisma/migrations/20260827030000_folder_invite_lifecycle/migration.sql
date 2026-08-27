-- CreateTable
CREATE TABLE `FolderInvite` (
    `id` VARCHAR(191) NOT NULL,
    `folderId` VARCHAR(191) NOT NULL,
    `createdByUserId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(6) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,

    UNIQUE INDEX `FolderInvite_code_key`(`code`),
    INDEX `FolderInvite_folderId_idx`(`folderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `FolderInvite` ADD CONSTRAINT `FolderInvite_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `FolderInvite` ADD CONSTRAINT `FolderInvite_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `FolderMember` ADD COLUMN `status` ENUM('ACTIVE', 'LEFT', 'KICKED') NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE `FolderMember` ADD COLUMN `leftAt` DATETIME(3) NULL;
ALTER TABLE `FolderMember` ADD COLUMN `lastJoinedInviteId` VARCHAR(191) NULL;

CREATE INDEX `FolderMember_folderId_status_idx` ON `FolderMember`(`folderId`, `status`);

ALTER TABLE `FolderMember` ADD CONSTRAINT `FolderMember_lastJoinedInviteId_fkey` FOREIGN KEY (`lastJoinedInviteId`) REFERENCES `FolderInvite`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop legacy permanent invite codes (owners re-issue via FolderInvite)
DROP INDEX `Folder_inviteCode_key` ON `Folder`;
ALTER TABLE `Folder` DROP COLUMN `inviteCode`;
