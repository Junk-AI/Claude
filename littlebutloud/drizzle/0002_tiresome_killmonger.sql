CREATE TABLE `member_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`username` varchar(100) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `member_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `member_accounts_memberId_unique` UNIQUE(`memberId`),
	CONSTRAINT `member_accounts_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`type` enum('connection_request','event_signup','collaboration_update','admin_message') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`relatedId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `status` enum('upcoming','past','cancelled','pending_approval') NOT NULL DEFAULT 'upcoming';--> statement-breakpoint
ALTER TABLE `events` ADD `createdByMemberId` int;--> statement-breakpoint
ALTER TABLE `events` ADD `eventType` enum('admin','member') DEFAULT 'admin' NOT NULL;--> statement-breakpoint
ALTER TABLE `member_accounts` ADD CONSTRAINT `member_accounts_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;