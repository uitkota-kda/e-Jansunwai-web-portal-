-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL,
    `section` VARCHAR(191) NULL,
    `zone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grievance` (
    `id` VARCHAR(191) NOT NULL,
    `grievanceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `subStatus` VARCHAR(191) NULL,
    `isEscalated` BOOLEAN NOT NULL DEFAULT false,
    `escalationLevel` INTEGER NOT NULL DEFAULT 0,
    `hearingDate` VARCHAR(191) NULL,
    `hearingTime` VARCHAR(191) NULL,
    `hearingLink` VARCHAR(191) NULL,
    `assignedOfficer` VARCHAR(191) NULL,
    `assignedSection` VARCHAR(191) NULL,
    `assignedZone` VARCHAR(191) NULL,
    `expectedDate` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `attachmentPath` VARCHAR(191) NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'WEB_PORTAL',
    `eeRemarks` VARCHAR(191) NULL,
    `eeStatus` VARCHAR(191) NULL,
    `eeActionDate` DATETIME(3) NULL,
    `directorNote` VARCHAR(191) NULL,
    `isReopened` BOOLEAN NOT NULL DEFAULT false,
    `reopenedBy` VARCHAR(191) NULL,
    `reopenReason` VARCHAR(191) NULL,
    `assignedToId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `satisfactionStatus` VARCHAR(191) NULL,
    `citizenFeedback` VARCHAR(191) NULL,
    `vcScheduledDate` DATETIME(3) NULL,
    `vcMeetingLink` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Grievance_grievanceId_key`(`grievanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActionLog` (
    `id` VARCHAR(191) NOT NULL,
    `grievanceId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `performedBy` VARCHAR(191) NOT NULL,
    `attachmentPath` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Grievance` ADD CONSTRAINT `Grievance_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActionLog` ADD CONSTRAINT `ActionLog_grievanceId_fkey` FOREIGN KEY (`grievanceId`) REFERENCES `Grievance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
