/*
  Warnings:

  - You are about to drop the column `accountSize` on the `AccountBasedMarketingTarget` table. All the data in the column will be lost.
  - You are about to drop the column `buyingStage` on the `AccountBasedMarketingTarget` table. All the data in the column will be lost.
  - You are about to drop the column `campaigns` on the `AccountBasedMarketingTarget` table. All the data in the column will be lost.
  - You are about to drop the column `decisionMakers` on the `AccountBasedMarketingTarget` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `AccountBasedMarketingTarget` table. All the data in the column will be lost.
  - You are about to drop the column `painPoints` on the `AccountBasedMarketingTarget` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `AccountBasedMarketingTarget` table. All the data in the column will be lost.
  - You are about to drop the column `revenuePotential` on the `AccountBasedMarketingTarget` table. All the data in the column will be lost.
  - You are about to drop the column `targetAccountName` on the `AccountBasedMarketingTarget` table. All the data in the column will be lost.
  - You are about to drop the column `teamMembers` on the `AccountBasedMarketingTarget` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "buyingStage" TEXT,
ADD COLUMN     "campaigns" TEXT[],
ADD COLUMN     "decisionMakers" TEXT[],
ADD COLUMN     "isabm" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "painPoints" TEXT[],
ADD COLUMN     "teamMembers" TEXT[];

-- AlterTable
ALTER TABLE "AccountBasedMarketingTarget" DROP COLUMN "accountSize",
DROP COLUMN "buyingStage",
DROP COLUMN "campaigns",
DROP COLUMN "decisionMakers",
DROP COLUMN "industry",
DROP COLUMN "painPoints",
DROP COLUMN "photoUrl",
DROP COLUMN "revenuePotential",
DROP COLUMN "targetAccountName",
DROP COLUMN "teamMembers";
