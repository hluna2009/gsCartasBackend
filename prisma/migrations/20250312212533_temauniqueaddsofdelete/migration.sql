-- DropIndex
DROP INDEX "Carta_temaId_key";

-- AlterTable
ALTER TABLE "Carta" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
