-- Fix members table schema to match current TypeScript schema
-- Remove: age, location, initiativeName, issueArea
-- Add: website, issueAreas (renamed from issueArea)
-- Keep: photoUrl, photoKey, coverImageUrl, coverImageKey, PDPA fields

ALTER TABLE `members`
DROP COLUMN IF EXISTS `age`,
DROP COLUMN IF EXISTS `location`,
DROP COLUMN IF EXISTS `initiativeName`,
DROP COLUMN IF EXISTS `issueArea`,
ADD COLUMN `website` text AFTER `social`,
MODIFY COLUMN `issueAreas` text AFTER `country`;
