-- AlterTable
ALTER TABLE "Carta" ADD COLUMN     "partida" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pdfInfo2" TEXT,
ADD COLUMN     "pdfInfoArreglo" TEXT[] DEFAULT ARRAY[]::TEXT[];
