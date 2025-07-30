/*
  Warnings:

  - A unique constraint covering the columns `[itemId]` on the table `carts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[santriId]` on the table `carts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "carts_itemId_key" ON "carts"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "carts_santriId_key" ON "carts"("santriId");
