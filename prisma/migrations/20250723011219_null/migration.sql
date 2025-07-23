-- AlterTable
ALTER TABLE "Santri" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Items" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "gamvar" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Items_pkey" PRIMARY KEY ("id")
);
