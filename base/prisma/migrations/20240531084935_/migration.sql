-- CreateEnum
CREATE TYPE "IcpCategory" AS ENUM ('FIT', 'UNFIT', 'PARTIALLY_FIT');

-- CreateTable
CREATE TABLE "IcpScore" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "category" "IcpCategory" NOT NULL,
    "icpId" TEXT NOT NULL,

    CONSTRAINT "IcpScore_pkey" PRIMARY KEY ("id")
);
