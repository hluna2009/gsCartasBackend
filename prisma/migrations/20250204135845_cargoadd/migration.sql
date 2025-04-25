-- AlterTable
ALTER TABLE "Carta" ADD COLUMN     "asuntoEnviado" TEXT,
ADD COLUMN     "cartaEnviada" TEXT,
ADD COLUMN     "codigoenviado" TEXT,
ADD COLUMN     "comentarioCargo" TEXT,
ADD COLUMN     "fechaEnvio" TIMESTAMP(3),
ADD COLUMN     "resumenEnviado" TEXT;
