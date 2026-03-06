/*
  Warnings:

  - You are about to drop the column `officeId` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the `AIResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CRMLead` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CRMLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExportJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Listing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ListingMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Office` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AIResult" DROP CONSTRAINT "AIResult_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_officeId_fkey";

-- DropForeignKey
ALTER TABLE "CRMLead" DROP CONSTRAINT "CRMLead_agentId_fkey";

-- DropForeignKey
ALTER TABLE "CRMLead" DROP CONSTRAINT "CRMLead_listingId_fkey";

-- DropForeignKey
ALTER TABLE "CRMLog" DROP CONSTRAINT "CRMLog_leadId_fkey";

-- DropForeignKey
ALTER TABLE "ExportJob" DROP CONSTRAINT "ExportJob_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_agentId_fkey";

-- DropForeignKey
ALTER TABLE "ListingMedia" DROP CONSTRAINT "ListingMedia_listingId_fkey";

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "officeId";

-- DropTable
DROP TABLE "AIResult";

-- DropTable
DROP TABLE "CRMLead";

-- DropTable
DROP TABLE "CRMLog";

-- DropTable
DROP TABLE "ExportJob";

-- DropTable
DROP TABLE "Listing";

-- DropTable
DROP TABLE "ListingMedia";

-- DropTable
DROP TABLE "Office";

-- DropEnum
DROP TYPE "ExportPlatform";

-- DropEnum
DROP TYPE "ExportStatus";

-- DropEnum
DROP TYPE "LeadSource";

-- DropEnum
DROP TYPE "LeadStatus";

-- DropEnum
DROP TYPE "ListingStatus";

-- DropEnum
DROP TYPE "ListingType";

-- DropEnum
DROP TYPE "LogType";

-- DropEnum
DROP TYPE "MediaCategory";

-- DropEnum
DROP TYPE "MediaProcessingStatus";
