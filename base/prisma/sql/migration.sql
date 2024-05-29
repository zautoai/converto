/*
  Warnings:

  - Added the required column `url` to the `ProspecJourney` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProspecJourney" ADD COLUMN     "url" TEXT NOT NULL;
ALTER TYPE "ProspecActivityType" ADD VALUE 'PAGE_CLOSED';
-- AlterTable
ALTER TABLE "ProspecJourney" ADD COLUMN     "previousPageId" TEXT;

-- CreateIndex
CREATE INDEX "ProspecJourney_previousPageId_idx" ON "ProspecJourney"("previousPageId");

-- AddForeignKey
ALTER TABLE "ProspecJourney" ADD CONSTRAINT "ProspecJourney_previousPageId_fkey" FOREIGN KEY ("previousPageId") REFERENCES "ProspecJourney"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "ProspectActivityType" AS ENUM ('CTA_PERFORMED', 'PAGE_VIEWED', 'PAGE_CLOSED', 'LINK_CLICKED', 'CHAT_INITIATED', 'OTHER');

-- CreateEnum
CREATE TYPE "IntentType" AS ENUM ('POSITIVE', 'NEGATIVE');

-- DropForeignKey
ALTER TABLE "ProspecJourney" DROP CONSTRAINT "ProspecJourney_previousPageId_fkey";

-- DropForeignKey
ALTER TABLE "ProspecJourney" DROP CONSTRAINT "ProspecJourney_visitId_fkey";

-- DropTable
DROP TABLE "ProspecJourney";

-- DropEnum
DROP TYPE "ProspecActivityType";

-- CreateTable
CREATE TABLE "ProspectJourney" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "data" TEXT,
    "url" TEXT NOT NULL,
    "type" "ProspectActivityType" NOT NULL DEFAULT 'OTHER',
    "timeSpend" INTEGER NOT NULL DEFAULT 0,
    "scrollDepth" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "previousPageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProspectJourney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntentScoring" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "type" "IntentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntentScoring_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProspectJourney_visitId_type_idx" ON "ProspectJourney"("visitId", "type");

-- CreateIndex
CREATE INDEX "ProspectJourney_previousPageId_idx" ON "ProspectJourney"("previousPageId");

-- CreateIndex
CREATE UNIQUE INDEX "IntentScoring_name_key" ON "IntentScoring"("name");

-- AddForeignKey
ALTER TABLE "ProspectJourney" ADD CONSTRAINT "ProspectJourney_previousPageId_fkey" FOREIGN KEY ("previousPageId") REFERENCES "ProspectJourney"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProspectJourney" ADD CONSTRAINT "ProspectJourney_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
