/*
  Warnings:

  - You are about to alter the column `harga` on the `Items` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `saldo` on the `Santri` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `hutang` on the `Santri` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Items" ALTER COLUMN "harga" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Santri" ALTER COLUMN "saldo" SET DEFAULT 0,
ALTER COLUMN "saldo" SET DATA TYPE INTEGER,
ALTER COLUMN "hutang" SET DATA TYPE INTEGER;
