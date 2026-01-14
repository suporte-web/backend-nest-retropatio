-- AlterTable
ALTER TABLE "Veiculo" ADD COLUMN     "ativo" BOOLEAN,
ADD COLUMN     "placaVeiculo" TEXT,
ADD COLUMN     "tipo" TEXT,
ALTER COLUMN "placaCavalo" DROP NOT NULL;
