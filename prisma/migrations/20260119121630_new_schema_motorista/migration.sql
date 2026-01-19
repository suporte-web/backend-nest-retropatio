/*
  Warnings:

  - You are about to drop the column `cpfMotorista` on the `Entrada` table. All the data in the column will be lost.
  - You are about to drop the column `motorista` on the `Entrada` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Entrada" DROP COLUMN "cpfMotorista",
DROP COLUMN "motorista",
ADD COLUMN     "motoristaId" TEXT;

-- CreateTable
CREATE TABLE "Motorista" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "dataNascimento" TEXT,
    "categoriaCarteira" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Motorista_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Motorista_cpf_key" ON "Motorista"("cpf");

-- AddForeignKey
ALTER TABLE "Entrada" ADD CONSTRAINT "Entrada_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "Motorista"("id") ON DELETE SET NULL ON UPDATE CASCADE;
