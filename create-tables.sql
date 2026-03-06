CREATE TABLE IF NOT EXISTS "Listing" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    type TEXT NOT NULL,
    price INTEGER NOT NULL,
    status TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ListingMedia" (
    id TEXT PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    url TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "originalName" TEXT NOT NULL,
    category TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "aiTags" TEXT[],
    "aiSaliencyScore" FLOAT,
    "processingStatus" TEXT NOT NULL DEFAULT 'QUEUED',
    "processedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "AIResult" (
    id TEXT PRIMARY KEY,
    "listingId" TEXT NOT NULL UNIQUE,
    headline TEXT,
    "shortDesc" TEXT,
    "longDesc" TEXT,
    "bulletPoints" JSON,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "instagramCaption" TEXT,
    "fbPost" TEXT,
    "priceSuggestion" INTEGER,
    "priceReasoning" TEXT,
    "targetAudience" TEXT,
    "bestTimeToPost" TEXT,
    recommendations JSON[],
    "featuredSuggestionId" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
