CREATE TABLE `event_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`fieldKey` varchar(80) NOT NULL,
	`label` varchar(255) NOT NULL,
	`questionType` enum('text','textarea','email','phone','number','select','checkbox') NOT NULL DEFAULT 'text',
	`options` text,
	`isRequired` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `event_registrations` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `event_registrations` ADD `ticketQuantity` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD `answers` text;--> statement-breakpoint
ALTER TABLE `event_questions` ADD CONSTRAINT `event_questions_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;