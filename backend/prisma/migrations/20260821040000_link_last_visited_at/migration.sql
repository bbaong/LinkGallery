ALTER TABLE `Link` ADD COLUMN `lastVisitedAt` DATETIME(3) NULL;

CREATE INDEX `Link_userId_lastVisitedAt_idx` ON `Link`(`userId`, `lastVisitedAt`);
