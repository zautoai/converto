-- CreateTable
CREATE TABLE "Dashboard" (
    "id" TEXT NOT NULL,
    "averageDealSize" INTEGER NOT NULL DEFAULT 0,
    "leadConversionRate" INTEGER NOT NULL DEFAULT 0,
    "leadRetentionRate" INTEGER NOT NULL DEFAULT 0,
    "marketingCost" INTEGER NOT NULL DEFAULT 0,
    "salesCost" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);