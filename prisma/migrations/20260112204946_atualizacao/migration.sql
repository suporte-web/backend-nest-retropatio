/*
  Warnings:

  - You are about to drop the column `tipoVagaId` on the `Vaga` table. All the data in the column will be lost.
  - Added the required column `tipoVaga` to the `Vaga` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vaga" DROP CONSTRAINT "Vaga_tipoVagaId_fkey";

-- AlterTable
ALTER TABLE "Vaga" DROP COLUMN "tipoVagaId",
ADD COLUMN     "tipoVaga" TEXT NOT NULL;
