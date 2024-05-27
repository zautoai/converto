/*
  Warnings:

  - You are about to drop the `ICP` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ICPMap` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ICPMap" DROP CONSTRAINT "ICPMap_icpId_fkey";

-- DropForeignKey
ALTER TABLE "ICPMap" DROP CONSTRAINT "ICPMap_segmentId_fkey";

-- DropTable
DROP TABLE "ICP";

-- DropTable
DROP TABLE "ICPMap";

-- CreateTable
CREATE TABLE "Icp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startValue" INTEGER NOT NULL,

    CONSTRAINT "Icp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IcpMap" (
    "id" TEXT NOT NULL,
    "icpId" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,

    CONSTRAINT "IcpMap_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IcpMap" ADD CONSTRAINT "IcpMap_icpId_fkey" FOREIGN KEY ("icpId") REFERENCES "Icp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IcpMap" ADD CONSTRAINT "IcpMap_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
