ALTER TABLE `Link` ADD COLUMN `category` VARCHAR(30) NULL;

CREATE INDEX `Link_folderId_category_idx` ON `Link`(`folderId`, `category`);
