CREATE TYPE "CleaningFrequencyType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'AFTER_USE', 'CUSTOM');

ALTER TABLE "CleaningEntity"
ADD COLUMN "monitoringEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "frequencyType" "CleaningFrequencyType" NOT NULL DEFAULT 'DAILY',
ADD COLUMN "expectedCleaningsPerDay" INTEGER DEFAULT 1,
ADD COLUMN "weeklyDays" JSONB,
ADD COLUMN "monthlyDays" JSONB,
ADD COLUMN "customIntervalHours" INTEGER,
ADD COLUMN "monitoringNotes" TEXT;
