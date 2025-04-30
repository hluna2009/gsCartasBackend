/*
  Warnings:

  - Changed the type of `destinatario` on the `Carta` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Carta" DROP COLUMN "destinatario",
ADD COLUMN     "destinatario" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "Carta" ADD CONSTRAINT "Carta_destinatario_fkey" FOREIGN KEY ("destinatario") REFERENCES "Destinatario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
