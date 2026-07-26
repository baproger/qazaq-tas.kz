-- AlterTable
ALTER TABLE `categories` ADD COLUMN `descriptionKk` TEXT NULL,
    ADD COLUMN `nameKk` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `descriptionKk` TEXT NULL,
    ADD COLUMN `nameKk` VARCHAR(191) NULL,
    ADD COLUMN `shortDescriptionKk` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `translations` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `group` VARCHAR(64) NOT NULL DEFAULT 'Общее',
    `ru` TEXT NOT NULL,
    `kk` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `translations_key_key`(`key`),
    INDEX `translations_group_idx`(`group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `group` VARCHAR(64) NOT NULL DEFAULT 'Общее',
    `label` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `site_settings_key_key`(`key`),
    INDEX `site_settings_group_idx`(`group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banners` (
    `id` VARCHAR(191) NOT NULL,
    `titleRu` VARCHAR(255) NOT NULL,
    `titleKk` VARCHAR(255) NOT NULL,
    `subtitleRu` VARCHAR(500) NULL,
    `subtitleKk` VARCHAR(500) NULL,
    `imageUrl` VARCHAR(512) NULL,
    `linkUrl` VARCHAR(512) NULL,
    `linkTextRu` VARCHAR(191) NULL,
    `linkTextKk` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `banners_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
