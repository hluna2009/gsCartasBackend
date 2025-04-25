-- CreateTable
CREATE TABLE "AreaResponsable" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "procedencia" TEXT,
    "creadoPorId" BIGINT,

    CONSTRAINT "AreaResponsable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubArea" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "areaResponsableId" BIGINT NOT NULL,
    "procedencia" TEXT,
    "jefatura" TEXT,
    "creadoPorId" BIGINT,

    CONSTRAINT "SubArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoPorId" BIGINT,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoPorId" BIGINT,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "apellidos" TEXT,
    "areaId" BIGINT,
    "subAreaId" BIGINT,
    "rolId" BIGINT NOT NULL,
    "procedencia" TEXT,
    "tipoUsuario" TEXT,
    "jefe" TEXT NOT NULL,
    "creadoPorId" BIGINT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carta" (
    "id" BIGSERIAL NOT NULL,
    "pdfInfo" TEXT,
    "codigoRecibido" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destinatario" TEXT,
    "asunto" TEXT,
    "esConfidencial" BOOLEAN NOT NULL,
    "devuelto" BOOLEAN NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Ingresado',
    "referencia" TEXT,
    "resumenRecibido" TEXT,
    "tema" TEXT,
    "nivelImpacto" TEXT,
    "correosCopia" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "areaResponsableId" BIGINT NOT NULL,
    "subAreaId" BIGINT,
    "empresaId" BIGINT NOT NULL,
    "temaId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tema" (
    "id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoPorId" BIGINT,

    CONSTRAINT "Tema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CartaToUsuario" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_CartaToUsuario_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Carta_temaId_key" ON "Carta"("temaId");

-- CreateIndex
CREATE INDEX "_CartaToUsuario_B_index" ON "_CartaToUsuario"("B");

-- AddForeignKey
ALTER TABLE "SubArea" ADD CONSTRAINT "SubArea_areaResponsableId_fkey" FOREIGN KEY ("areaResponsableId") REFERENCES "AreaResponsable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "AreaResponsable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_subAreaId_fkey" FOREIGN KEY ("subAreaId") REFERENCES "SubArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carta" ADD CONSTRAINT "Carta_areaResponsableId_fkey" FOREIGN KEY ("areaResponsableId") REFERENCES "AreaResponsable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carta" ADD CONSTRAINT "Carta_subAreaId_fkey" FOREIGN KEY ("subAreaId") REFERENCES "SubArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carta" ADD CONSTRAINT "Carta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carta" ADD CONSTRAINT "Carta_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "Tema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartaToUsuario" ADD CONSTRAINT "_CartaToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "Carta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartaToUsuario" ADD CONSTRAINT "_CartaToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
