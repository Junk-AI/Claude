CREATE TABLE `member_event_signups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `member_event_signups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `member_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`venue` varchar(255) NOT NULL,
	`startTime` varchar(10) NOT NULL,
	`endTime` varchar(10) NOT NULL,
	`date` timestamp NOT NULL,
	`contactPerson` varchar(255) NOT NULL,
	`details` text NOT NULL,
	`volunteerLimit` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `member_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `member_event_signups` ADD CONSTRAINT `member_event_signups_eventId_member_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `member_events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member_events` ADD CONSTRAINT `member_events_memberId_members_id_fk` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE cascade ON UPDATE no action;