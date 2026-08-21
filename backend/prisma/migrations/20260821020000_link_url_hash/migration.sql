ALTER TABLE `Link` ADD COLUMN `urlHash` CHAR(64) NULL;

UPDATE `Link` SET `urlHash` = SHA2(`url`, 256) WHERE `urlHash` IS NULL;

DROP INDEX `Link_folderId_url_key` ON `Link`;

ALTER TABLE `Link` MODIFY `url` VARCHAR(2048) NOT NULL;
ALTER TABLE `Link` MODIFY `faviconUrl` VARCHAR(512) NULL;
ALTER TABLE `Link` MODIFY `urlHash` CHAR(64) NOT NULL;

CREATE UNIQUE INDEX `Link_folderId_urlHash_key` ON `Link`(`folderId`, `urlHash`);
