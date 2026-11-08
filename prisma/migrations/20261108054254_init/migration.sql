-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ARTISAN', 'BUYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GlazeType" AS ENUM ('MEN_RAN_CO', 'MEN_LAM_CO', 'MEN_NGOC', 'MEN_HOA_BIEN', 'MEN_TRANG_NGA');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT_REQUEST', 'SENT_TO_ARTISANS', 'ARTISANS_BIDDING', 'BUYER_ACCEPTED', 'IN_PRODUCTION', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "HeritageKind" AS ENUM ('MUSEUM', 'KILN', 'TEMPLE', 'MARKET');

-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('NGUYEN_LIEU', 'LICH_CUP_DIEN', 'CHINH_SACH', 'SU_KIEN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'BUYER',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "phone" TEXT,
    "avatarUrl" TEXT,
    "organization" TEXT,
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtisanProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "workshopName" TEXT NOT NULL,
    "artisanName" TEXT NOT NULL,
    "artisanTitle" TEXT NOT NULL,
    "clanName" TEXT NOT NULL,
    "establishedYear" INTEGER NOT NULL,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "tagline" TEXT,
    "familyHistory" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phone" TEXT,
    "isOpenForVisit" BOOLEAN NOT NULL DEFAULT true,
    "openingHours" TEXT NOT NULL DEFAULT '08:00-17:00',
    "openDays" INTEGER[] DEFAULT ARRAY[0, 1, 2, 3, 4, 5, 6]::INTEGER[],
    "experienceOffered" BOOLEAN NOT NULL DEFAULT false,
    "experiencePriceVnd" INTEGER NOT NULL DEFAULT 0,
    "acceptsWholesale" BOOLEAN NOT NULL DEFAULT true,
    "maxMonthlyCapacity" INTEGER NOT NULL DEFAULT 3000,
    "specialties" "GlazeType"[],
    "certifications" JSONB NOT NULL DEFAULT '[]',
    "workshopImages" JSONB NOT NULL DEFAULT '[]',
    "coverImage" JSONB,
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationNote" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "nationalIdEnc" TEXT,
    "proofDocuments" JSONB NOT NULL DEFAULT '[]',
    "searchText" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtisanProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "glazeType" "GlazeType" NOT NULL,
    "priceVnd" INTEGER NOT NULL,
    "dimensions" TEXT NOT NULL,
    "firingTempC" INTEGER NOT NULL DEFAULT 1300,
    "glazeThickness" TEXT NOT NULL DEFAULT '0.3mm',
    "story" TEXT NOT NULL,
    "images" JSONB NOT NULL DEFAULT '[]',
    "isUniquePiece" BOOLEAN NOT NULL DEFAULT false,
    "stock" INTEGER NOT NULL DEFAULT 1,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "searchText" TEXT NOT NULL DEFAULT '',
    "currentBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBatch" (
    "id" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "batchTitle" TEXT NOT NULL,
    "glazeType" "GlazeType" NOT NULL DEFAULT 'MEN_LAM_CO',
    "clayOrigin" TEXT NOT NULL DEFAULT 'Đất sét Trúc Thôn và đất sét trắng Đông Triều',
    "claySoakDuration" TEXT NOT NULL DEFAULT '4 tháng qua hệ thống 4 bể (bể đánh, bể lắng, bể phơi, bể ủ)',
    "kilnType" TEXT NOT NULL DEFAULT 'Lò gas kiểm soát nhiệt độ tự động',
    "peakTempC" INTEGER NOT NULL DEFAULT 1300,
    "firingDurationHr" INTEGER NOT NULL DEFAULT 18,
    "quantityProduced" INTEGER NOT NULL,
    "qrCodeDataUrl" TEXT NOT NULL,
    "productionStages" JSONB NOT NULL DEFAULT '[]',
    "status" "BatchStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "lockedAt" TIMESTAMP(3),
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "coverImage" JSONB,
    "quoteRequestId" TEXT,
    "allocatedQuantity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "preferredGlaze" "GlazeType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "targetBudgetPerUnit" INTEGER NOT NULL,
    "deadlineDays" INTEGER NOT NULL,
    "specifications" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "referenceImages" JSONB NOT NULL DEFAULT '[]',
    "biddingClosesAt" TIMESTAMP(3),
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT_REQUEST',
    "version" INTEGER NOT NULL DEFAULT 1,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteInvitation" (
    "id" TEXT NOT NULL,
    "quoteRequestId" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "matchReasons" JSONB NOT NULL DEFAULT '[]',
    "invitedBy" TEXT NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteBid" (
    "id" TEXT NOT NULL,
    "quoteRequestId" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "offeredPricePerUnit" INTEGER NOT NULL,
    "committedQuantity" INTEGER NOT NULL,
    "estimatedDays" INTEGER NOT NULL,
    "proposalNote" TEXT NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "allocatedQuantity" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteStatusHistory" (
    "id" TEXT NOT NULL,
    "quoteRequestId" TEXT NOT NULL,
    "fromStatus" "QuoteStatus",
    "toStatus" "QuoteStatus" NOT NULL,
    "actorId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityNews" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "NewsCategory" NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" JSONB,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityNews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeritageSite" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "HeritageKind" NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "openingHours" TEXT,
    "ticketInfo" TEXT,
    "image" JSONB,

    CONSTRAINT "HeritageSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtisanProfile_userId_key" ON "ArtisanProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtisanProfile_slug_key" ON "ArtisanProfile"("slug");

-- CreateIndex
CREATE INDEX "ArtisanProfile_verificationStatus_idx" ON "ArtisanProfile"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_glazeType_idx" ON "Product"("glazeType");

-- CreateIndex
CREATE INDEX "Product_artisanId_idx" ON "Product"("artisanId");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBatch_batchCode_key" ON "ProductBatch"("batchCode");

-- CreateIndex
CREATE INDEX "ProductBatch_artisanId_idx" ON "ProductBatch"("artisanId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequest_requestCode_key" ON "QuoteRequest"("requestCode");

-- CreateIndex
CREATE INDEX "QuoteRequest_status_idx" ON "QuoteRequest"("status");

-- CreateIndex
CREATE INDEX "QuoteRequest_buyerId_idx" ON "QuoteRequest"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteInvitation_quoteRequestId_artisanId_key" ON "QuoteInvitation"("quoteRequestId", "artisanId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteBid_quoteRequestId_artisanId_key" ON "QuoteBid"("quoteRequestId", "artisanId");

-- CreateIndex
CREATE INDEX "QuoteStatusHistory_quoteRequestId_idx" ON "QuoteStatusHistory"("quoteRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityNews_slug_key" ON "CommunityNews"("slug");

-- CreateIndex
CREATE INDEX "CommunityNews_publishedAt_idx" ON "CommunityNews"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HeritageSite_slug_key" ON "HeritageSite"("slug");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtisanProfile" ADD CONSTRAINT "ArtisanProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "ArtisanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_currentBatchId_fkey" FOREIGN KEY ("currentBatchId") REFERENCES "ProductBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBatch" ADD CONSTRAINT "ProductBatch_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "ArtisanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBatch" ADD CONSTRAINT "ProductBatch_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteInvitation" ADD CONSTRAINT "QuoteInvitation_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteInvitation" ADD CONSTRAINT "QuoteInvitation_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "ArtisanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteBid" ADD CONSTRAINT "QuoteBid_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteBid" ADD CONSTRAINT "QuoteBid_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "ArtisanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteStatusHistory" ADD CONSTRAINT "QuoteStatusHistory_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteStatusHistory" ADD CONSTRAINT "QuoteStatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityNews" ADD CONSTRAINT "CommunityNews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
