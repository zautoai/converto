-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('OPPORTUNITY', 'CLOSE_WON', 'CLOSE_LOSS');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "dealStatus" "DealStatus" NOT NULL DEFAULT 'OPPORTUNITY';
