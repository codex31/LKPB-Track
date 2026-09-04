CREATE TABLE `lkpb_source_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceKey` varchar(128) NOT NULL,
	`year` varchar(4) NOT NULL,
	`pool` varchar(128) NOT NULL,
	`label` varchar(255) NOT NULL,
	`spreadsheetId` varchar(128) NOT NULL,
	`sheetName` varchar(128) NOT NULL DEFAULT 'Detail LKPB',
	`enabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lkpb_source_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `lkpb_source_settings_sourceKey_unique` UNIQUE(`sourceKey`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` varchar(16) NOT NULL DEFAULT 'user';