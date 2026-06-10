-- Ajusta o nome do campo usado nas URLs/QR Codes.
ALTER TABLE "CleaningEntity" RENAME COLUMN "qrCodeSlug" TO "slug";

-- Ajusta o nome do índice único para acompanhar o schema atual.
ALTER INDEX "CleaningEntity_qrCodeSlug_key" RENAME TO "CleaningEntity_slug_key";

-- Mantém o padrão de role igual ao schema atual.
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'MANAGER';
