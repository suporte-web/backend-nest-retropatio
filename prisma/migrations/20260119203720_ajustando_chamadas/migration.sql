-- CreateTable
CREATE TABLE "Chamadas" (
    "id" TEXT NOT NULL,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "veiculoId" TEXT,
    "motoristaId" TEXT,

    CONSTRAINT "Chamadas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chamadas" ADD CONSTRAINT "Chamadas_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamadas" ADD CONSTRAINT "Chamadas_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "Motorista"("id") ON DELETE SET NULL ON UPDATE CASCADE;
