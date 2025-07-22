/*
  Warnings:

  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "access_token" TEXT,
ADD COLUMN     "refresh_token" TEXT,
ALTER COLUMN "name" SET NOT NULL;
