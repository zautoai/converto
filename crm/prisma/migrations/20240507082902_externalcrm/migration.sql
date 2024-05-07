/*
  Warnings:

  - Made the column `accountType` on table `Account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "accountType" SET NOT NULL,
ALTER COLUMN "accountType" SET DEFAULT 'PROSPECT';

-- CreateTable
CREATE TABLE "ExternalCrmCredential" (
    "id" TEXT NOT NULL,
    "tokeType" TEXT,
    "refreshToken" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expiresIn" INTEGER NOT NULL,
    "crmName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalCrmCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmMapping" (
    "id" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "externalCRMObjectType" TEXT NOT NULL,
    "externalCRMFieldName" TEXT NOT NULL,
    "crmName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrmMapping_objectType_fieldName_externalCRMObjectType_exter_key" ON "CrmMapping"("objectType", "fieldName", "externalCRMObjectType", "externalCRMFieldName");
