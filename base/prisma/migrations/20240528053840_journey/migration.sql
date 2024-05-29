-- AlterTable
ALTER TABLE "ProspecJourney" ADD COLUMN     "previousPageId" TEXT;

-- CreateIndex
CREATE INDEX "ProspecJourney_previousPageId_idx" ON "ProspecJourney"("previousPageId");

-- AddForeignKey
ALTER TABLE "ProspecJourney" ADD CONSTRAINT "ProspecJourney_previousPageId_fkey" FOREIGN KEY ("previousPageId") REFERENCES "ProspecJourney"("id") ON DELETE SET NULL ON UPDATE CASCADE;
