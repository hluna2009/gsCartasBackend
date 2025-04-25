/*
  Warnings:

  - The `referencia` column on the `Carta` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Carta" DROP COLUMN "referencia",
ADD COLUMN     "referencia" BIGINT;

-- AddForeignKey
ALTER TABLE "Carta" ADD CONSTRAINT "Carta_referencia_fkey" FOREIGN KEY ("referencia") REFERENCES "Carta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
