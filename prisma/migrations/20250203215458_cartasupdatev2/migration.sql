/*
  Warnings:

  - Made the column `pdfInfo` on table `Carta` required. This step will fail if there are existing NULL values in that column.
  - Made the column `codigoRecibido` on table `Carta` required. This step will fail if there are existing NULL values in that column.
  - Made the column `destinatario` on table `Carta` required. This step will fail if there are existing NULL values in that column.
  - Made the column `asunto` on table `Carta` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Carta" DROP CONSTRAINT "Carta_areaResponsableId_fkey";

-- DropForeignKey
ALTER TABLE "Carta" DROP CONSTRAINT "Carta_empresaId_fkey";

-- AlterTable
ALTER TABLE "Carta" ALTER COLUMN "pdfInfo" SET NOT NULL,
ALTER COLUMN "codigoRecibido" SET NOT NULL,
ALTER COLUMN "destinatario" SET NOT NULL,
ALTER COLUMN "asunto" SET NOT NULL,
ALTER COLUMN "devuelto" SET DEFAULT false,
ALTER COLUMN "areaResponsableId" DROP NOT NULL,
ALTER COLUMN "empresaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Carta" ADD CONSTRAINT "Carta_areaResponsableId_fkey" FOREIGN KEY ("areaResponsableId") REFERENCES "AreaResponsable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carta" ADD CONSTRAINT "Carta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
