/*
  Warnings:

  - Added the required column `url` to the `ProspecJourney` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProspecJourney" ADD COLUMN     "url" TEXT NOT NULL;
