/*
  Warnings:

  - You are about to drop the column `gamvar` on the `Items` table. All the data in the column will be lost.
  - The `saldo` column on the `Santri` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `hutang` column on the `Santri` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `gambar` to the `Items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Items" DROP COLUMN "gamvar",
ADD COLUMN     "gambar" TEXT NOT NULL,
ALTER COLUMN "jumlah" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Santri" DROP COLUMN "saldo",
ADD COLUMN     "saldo" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "hutang",
ADD COLUMN     "hutang" INTEGER;
