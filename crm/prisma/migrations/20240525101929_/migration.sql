/*
  Warnings:

  - You are about to drop the `Segement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SegementCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Segement" DROP CONSTRAINT "Segement_segementCategoryId_fkey";

-- DropTable
DROP TABLE "Segement";

-- DropTable
DROP TABLE "SegementCategory";

-- CreateTable
CREATE TABLE "SegmentCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#ffffff',

    CONSTRAINT "SegmentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "segmentCategoryId" TEXT NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SegmentCategory_name_key" ON "SegmentCategory"("name");

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_segmentCategoryId_fkey" FOREIGN KEY ("segmentCategoryId") REFERENCES "SegmentCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
