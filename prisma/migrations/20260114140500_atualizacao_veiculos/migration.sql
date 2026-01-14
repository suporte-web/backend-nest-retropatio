/*
  Warnings:

  - The `status` column on the `Veiculo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `placaVeiculo` on table `Veiculo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tipoVeiculo` on table `Veiculo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Veiculo" DROP COLUMN "status",
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "placaVeiculo" SET NOT NULL,
ALTER COLUMN "tipoVeiculo" SET NOT NULL;
