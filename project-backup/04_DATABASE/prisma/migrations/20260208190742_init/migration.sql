-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('APARTMENT', 'HOUSE', 'LAND');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('NEW', 'ACTIVE', 'RESERVED', 'SOLD');

-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('LIVING_ROOM', 'KITCHEN', 'BATHROOM', 'BEDROOM', 'HALLWAY', 'FACADE', 'ADVERTISEMENT', 'HIDDEN');

-- CreateEnum
CREATE TYPE "MediaProcessingStatus" AS ENUM ('QUEUED', 'PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('SREALITY', 'BEZREALITKY', 'FACEBOOK', 'INSTAGRAM', 'WEB', 'REFERRAL', 'PERSONAL');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'INITIAL_CONTACT', 'PROSPECT', 'RESERVATION', 'SOLD', 'LOST');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('EMAIL', 'CALL', 'SMS', 'LETTER', 'MEETING');

-- CreateEnum
CREATE TYPE "ExportPlatform" AS ENUM ('SREALITY', 'BEZREALITKY', 'FACEBOOK_MARKETPLACE', 'INSTAGRAM', 'PDF', 'WEB', 'EMAIL_CAMPAIGN');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('PREPARING', 'READY', 'PUBLISHING', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branding" JSONB,
    "settings" JSONB NOT NULL,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" "ListingType" NOT NULL,
    "area" DOUBLE PRECISION,
    "price" INTEGER NOT NULL,
    "rooms" INTEGER,
    "floor" INTEGER,
    "yearBuilt" INTEGER,
    "status" "ListingStatus" NOT NULL,
    "agentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingMedia" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "originalName" TEXT NOT NULL,
    "category" "MediaCategory" NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "listingId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3),
    "processingStatus" "MediaProcessingStatus" NOT NULL,
    "aiTags" TEXT[],
    "aiSaliencyScore" DOUBLE PRECISION,

    CONSTRAINT "ListingMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIResult" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "headline" TEXT,
    "shortDesc" TEXT,
    "longDesc" TEXT,
    "bulletPoints" JSONB,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "instagramCaption" TEXT,
    "fbPost" TEXT,
    "priceSuggestion" INTEGER,
    "priceReasoning" TEXT,
    "targetAudience" TEXT,
    "bestTimeToPost" TEXT,
    "recommendations" JSONB[],
    "featuredSuggestionId" TEXT,

    CONSTRAINT "AIResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "listingId" TEXT,
    "agentId" TEXT,
    "source" "LeadSource" NOT NULL,
    "status" "LeadStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMLog" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CRMLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "platform" "ExportPlatform" NOT NULL,
    "status" "ExportStatus" NOT NULL,
    "payload" JSONB,
    "externalId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_email_key" ON "Agent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AIResult_listingId_key" ON "AIResult"("listingId");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingMedia" ADD CONSTRAINT "ListingMedia_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIResult" ADD CONSTRAINT "AIResult_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMLead" ADD CONSTRAINT "CRMLead_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMLead" ADD CONSTRAINT "CRMLead_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMLog" ADD CONSTRAINT "CRMLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CRMLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportJob" ADD CONSTRAINT "ExportJob_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
