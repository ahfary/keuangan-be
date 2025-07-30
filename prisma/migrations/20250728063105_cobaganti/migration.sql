/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,itemId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionId` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Cart_itemId_key";

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "sessionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_sessionId_itemId_key" ON "Cart"("sessionId", "itemId");
