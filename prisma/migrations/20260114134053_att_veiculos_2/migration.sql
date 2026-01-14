/*
  Warnings:

  - You are about to drop the column `ativo` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `cpfMotorista` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `cte` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `dataEntrada` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `dataSaida` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `filialId` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `lacre` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `motorista` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `nf` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `placaCavalo` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `situacao` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `transportadora` on the `Veiculo` table. All the data in the column will be lost.
  - You are about to drop the column `vagaId` on the `Veiculo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[placaVeiculo]` on the table `Veiculo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Veiculo" DROP CONSTRAINT "Veiculo_filialId_fkey";

-- DropForeignKey
ALTER TABLE "Veiculo" DROP CONSTRAINT "Veiculo_vagaId_fkey";

-- DropIndex
DROP INDEX "Veiculo_placaCavalo_key";

-- AlterTable
ALTER TABLE "Veiculo" DROP COLUMN "ativo",
DROP COLUMN "cpfMotorista",
DROP COLUMN "cte",
DROP COLUMN "dataEntrada",
DROP COLUMN "dataSaida",
DROP COLUMN "filialId",
DROP COLUMN "lacre",
DROP COLUMN "motorista",
DROP COLUMN "nf",
DROP COLUMN "placaCavalo",
DROP COLUMN "situacao",
DROP COLUMN "tipo",
DROP COLUMN "transportadora",
DROP COLUMN "vagaId",
ADD COLUMN     "marcaVeiculo" TEXT,
ADD COLUMN     "modeloVeiculo" TEXT,
ADD COLUMN     "tipoVeiculo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_placaVeiculo_key" ON "Veiculo"("placaVeiculo");
