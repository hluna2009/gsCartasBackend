-- CreateTable
CREATE TABLE "Destinatario" (
    "id" BIGSERIAL NOT NULL,
    "tipodoc" TEXT NOT NULL,
    "numdoc" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Destinatario_pkey" PRIMARY KEY ("id")
);
