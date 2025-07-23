-- CreateTable
CREATE TABLE "Santri" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "saldo" TEXT NOT NULL DEFAULT '0',
    "hutang" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Santri_pkey" PRIMARY KEY ("id")
);
