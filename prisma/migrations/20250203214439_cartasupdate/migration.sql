-- AlterTable
ALTER TABLE "Carta" ADD COLUMN     "cartaborrador" TEXT,
ADD COLUMN     "comentario" TEXT,
ADD COLUMN     "fechadevencimiento" TIMESTAMP(3),
ADD COLUMN     "informativo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "urgente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vencimiento" BOOLEAN NOT NULL DEFAULT false;
