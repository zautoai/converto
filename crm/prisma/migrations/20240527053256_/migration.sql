-- CreateTable
CREATE TABLE "ICP" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startValue" INTEGER NOT NULL,

    CONSTRAINT "ICP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ICPMap" (
    "id" TEXT NOT NULL,
    "icpId" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,

    CONSTRAINT "ICPMap_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ICPMap" ADD CONSTRAINT "ICPMap_icpId_fkey" FOREIGN KEY ("icpId") REFERENCES "ICP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ICPMap" ADD CONSTRAINT "ICPMap_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
