-- CreateTable
CREATE TABLE "CartaAdjunto" (
    "id" BIGSERIAL NOT NULL,
    "cartaId" BIGINT NOT NULL,
    "filepath" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "CartaAdjunto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CartaAdjunto" ADD CONSTRAINT "CartaAdjunto_cartaId_fkey" FOREIGN KEY ("cartaId") REFERENCES "Carta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
