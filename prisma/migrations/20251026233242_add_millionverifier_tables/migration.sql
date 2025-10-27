-- AlterTable
ALTER TABLE "User" ADD COLUMN     "millionverifierApiKey" TEXT;

-- CreateTable
CREATE TABLE "VerificationHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "resultcode" INTEGER NOT NULL,
    "quality" TEXT,
    "subresult" TEXT,
    "free" BOOLEAN NOT NULL DEFAULT false,
    "role" BOOLEAN NOT NULL DEFAULT false,
    "didyoumean" TEXT,
    "creditsUsed" INTEGER NOT NULL DEFAULT 1,
    "executionTime" INTEGER,
    "error" TEXT,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "uniqueEmails" INTEGER NOT NULL DEFAULT 0,
    "verified" INTEGER NOT NULL DEFAULT 0,
    "percent" INTEGER NOT NULL DEFAULT 0,
    "okCount" INTEGER NOT NULL DEFAULT 0,
    "catchAllCount" INTEGER NOT NULL DEFAULT 0,
    "disposableCount" INTEGER NOT NULL DEFAULT 0,
    "invalidCount" INTEGER NOT NULL DEFAULT 0,
    "unknownCount" INTEGER NOT NULL DEFAULT 0,
    "reverifyCount" INTEGER NOT NULL DEFAULT 0,
    "credit" INTEGER NOT NULL DEFAULT 0,
    "estimatedTimeSec" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "stripePaymentIntentId" TEXT,
    "millionverifierFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationHistory_userId_idx" ON "VerificationHistory"("userId");

-- CreateIndex
CREATE INDEX "VerificationHistory_email_idx" ON "VerificationHistory"("email");

-- CreateIndex
CREATE INDEX "VerificationHistory_createdAt_idx" ON "VerificationHistory"("createdAt");

-- CreateIndex
CREATE INDEX "BulkJob_userId_idx" ON "BulkJob"("userId");

-- CreateIndex
CREATE INDEX "BulkJob_fileId_idx" ON "BulkJob"("fileId");

-- CreateIndex
CREATE INDEX "BulkJob_status_idx" ON "BulkJob"("status");

-- CreateIndex
CREATE INDEX "BulkJob_createdAt_idx" ON "BulkJob"("createdAt");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "CreditTransaction_type_idx" ON "CreditTransaction"("type");

-- CreateIndex
CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");

-- AddForeignKey
ALTER TABLE "VerificationHistory" ADD CONSTRAINT "VerificationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkJob" ADD CONSTRAINT "BulkJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
