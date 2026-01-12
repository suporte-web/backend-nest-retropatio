-- CreateTable
CREATE TABLE "Filial" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Filial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFilial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFilial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "filialId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nome" TEXT,
    "primeiroAcesso" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoVaga" (
    "Id" SERIAL NOT NULL,
    "Nome" VARCHAR(100) NOT NULL,

    CONSTRAINT "TipoVaga_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Vaga" (
    "id" SERIAL NOT NULL,
    "filialId" TEXT NOT NULL,
    "tipoVagaId" INTEGER NOT NULL,
    "NomeVaga" VARCHAR(50) NOT NULL,
    "status" TEXT DEFAULT 'livre',

    CONSTRAINT "Vaga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrada" (
    "id" SERIAL NOT NULL,
    "filialId" TEXT NOT NULL,
    "vagaId" INTEGER NOT NULL,
    "placaCavalo" TEXT NOT NULL,
    "placaCarreta" TEXT,
    "motorista" TEXT NOT NULL,
    "proprietario" TEXT,
    "tipo" TEXT NOT NULL,
    "tipoVeiculoCategoria" TEXT,
    "tipoProprietario" TEXT,
    "cliente" TEXT,
    "transportadora" TEXT,
    "statusCarga" TEXT,
    "doca" TEXT,
    "valor" DOUBLE PRECISION,
    "cte" TEXT,
    "nf" TEXT,
    "lacre" TEXT,
    "cpfMotorista" TEXT,
    "observacoes" TEXT,
    "multi" BOOLEAN DEFAULT false,
    "status" TEXT DEFAULT 'ativo',
    "dataEntrada" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "dataSaida" TIMESTAMP(3),
    "veiculoId" TEXT,

    CONSTRAINT "Entrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitante" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "empresa" TEXT,
    "tipoVisita" TEXT NOT NULL,
    "motivoVisita" TEXT,
    "status" TEXT DEFAULT 'aguardando',
    "dataEntrada" TIMESTAMP(6),
    "dataSaida" TIMESTAMP(6),
    "filialId" TEXT NOT NULL,

    CONSTRAINT "Visitante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Veiculo" (
    "id" TEXT NOT NULL,
    "placaCavalo" TEXT NOT NULL,
    "placaCarreta" TEXT,
    "motorista" TEXT NOT NULL,
    "cpfMotorista" TEXT,
    "transportadora" TEXT,
    "cliente" TEXT,
    "cte" TEXT,
    "nf" TEXT,
    "lacre" TEXT,
    "dataEntrada" TIMESTAMP(3) NOT NULL,
    "dataSaida" TIMESTAMP(3),
    "status" TEXT,
    "situacao" TEXT NOT NULL,
    "filialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vagaId" INTEGER,

    CONSTRAINT "Veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "dadosAntes" TEXT,
    "dadosDepois" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Filial_codigo_key" ON "Filial"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "UserFilial_userId_filialId_key" ON "UserFilial"("userId", "filialId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TipoVaga_Nome_key" ON "TipoVaga"("Nome");

-- CreateIndex
CREATE INDEX "idx_visitante_cpf" ON "Visitante"("cpf");

-- CreateIndex
CREATE INDEX "idx_visitante_filial" ON "Visitante"("filialId");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_cnpj_key" ON "Fornecedor"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_placaCavalo_key" ON "Veiculo"("placaCavalo");

-- AddForeignKey
ALTER TABLE "UserFilial" ADD CONSTRAINT "UserFilial_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserFilial" ADD CONSTRAINT "UserFilial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaga" ADD CONSTRAINT "Vaga_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaga" ADD CONSTRAINT "Vaga_tipoVagaId_fkey" FOREIGN KEY ("tipoVagaId") REFERENCES "TipoVaga"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Vaga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitante" ADD CONSTRAINT "fk_visitante_filial" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Veiculo" ADD CONSTRAINT "Veiculo_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Veiculo" ADD CONSTRAINT "Veiculo_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Vaga"("id") ON DELETE SET NULL ON UPDATE CASCADE;
