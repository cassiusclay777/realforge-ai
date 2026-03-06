-- CreateTable
CREATE TABLE "ProcessedPhotos" (
    "id" TEXT NOT NULL,
    "listingId" TEXT,
    "categories" JSONB NOT NULL,
    "outputZipUrl" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessedPhotos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProcessedPhotos" ADD CONSTRAINT "ProcessedPhotos_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
