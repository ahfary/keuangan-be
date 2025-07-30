/*
  Warnings:

  - You are about to drop the column `sessionId` on the `Cart` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[santriId,itemId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `santriId` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Cart_sessionId_itemId_key";

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "sessionId",
ADD COLUMN     "santriId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Items" ALTER COLUMN "harga" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Santri" ALTER COLUMN "saldo" SET DEFAULT 0,
ALTER COLUMN "saldo" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "hutang" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "history" (
    "id" SERIAL NOT NULL,
    "santriId" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_items" (
    "id" SERIAL NOT NULL,
    "historyId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtPurchase" INTEGER NOT NULL,

    CONSTRAINT "history_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_santriId_itemId_key" ON "Cart"("santriId", "itemId");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_items" ADD CONSTRAINT "history_items_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "history"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_items" ADD CONSTRAINT "history_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
