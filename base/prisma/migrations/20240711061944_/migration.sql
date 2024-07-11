/*
  Warnings:

  - Added the required column `modifiedAt` to the `Dashboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifiedAt` to the `IcpScore` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AiUsageType" AS ENUM ('AVATAR_HELPER', 'ASSISTANT', 'CALENDAR_OBSERVER', 'CATEGORIZER', 'CTA_GENERATOR', 'CTA_SELECTOR', 'CRM_MAPPER', 'DEMAND_GEN_CAMPAIGN_FINDER', 'ICP_SCORE_GENERATOR', 'INTENT_SCORE_GENERATOR', 'LEAD_OBSERVER', 'OTHERS', 'PAGE_GREETER', 'PAGE_SELECTOR', 'STARTER_GENERATOR', 'SUMMARIZER');

-- AlterTable
ALTER TABLE "Dashboard" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modifiedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "IcpScore" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modifiedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Usage" (
    "id" TEXT NOT NULL,
    "taskName" "AiUsageType" NOT NULL DEFAULT 'OTHERS',
    "inputToken" INTEGER NOT NULL,
    "outputToken" INTEGER NOT NULL,
    "modelName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);
