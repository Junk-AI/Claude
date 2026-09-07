ALTER TABLE `connection_requests` MODIFY COLUMN `status` enum('pending','sent','failed') NOT NULL;--> statement-breakpoint
ALTER TABLE `connection_requests` MODIFY COLUMN `createdAt` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `connection_requests` ADD `purpose` varchar(255);--> statement-breakpoint
ALTER TABLE `connection_requests` ADD `updatedAt` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `startTime` varchar(10);--> statement-breakpoint
ALTER TABLE `events` ADD `endTime` varchar(10);--> statement-breakpoint
ALTER TABLE `events` ADD `capacityLimit` int;--> statement-breakpoint
ALTER TABLE `members` ADD `customCause` varchar(255);--> statement-breakpoint
ALTER TABLE `members` ADD `website` text;--> statement-breakpoint
ALTER TABLE `members` ADD `peopleWithCourses` text;--> statement-breakpoint
ALTER TABLE `connection_requests` ADD CONSTRAINT `connection_requests_fromMemberId_members_id_fk` FOREIGN KEY (`fromMemberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `connection_requests` ADD CONSTRAINT `connection_requests_toMemberId_members_id_fk` FOREIGN KEY (`toMemberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `members` DROP COLUMN `age`;--> statement-breakpoint
ALTER TABLE `members` DROP COLUMN `location`;--> statement-breakpoint
ALTER TABLE `members` DROP COLUMN `initiativeName`;