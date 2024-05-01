/*
  Warnings:

  - A unique constraint covering the columns `[crmContactid]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('REPORTING', 'CLOSEDWON', 'CLOSEDLOST');

-- AlterEnum
ALTER TYPE "MessageMediaType" ADD VALUE 'PAGE_ACTIVITY';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "crmContactid" TEXT,
ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'REPORTING';

-- AlterTable
ALTER TABLE "ZautoMessage" ADD COLUMN     "activityJson" JSONB,
ALTER COLUMN "content" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_crmContactid_key" ON "Lead"("crmContactid");
