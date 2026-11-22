-- AlterTable
ALTER TABLE "ScanEvent" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "ScanEvent_userId_createdAt_idx" ON "ScanEvent"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ScanEvent" ADD CONSTRAINT "ScanEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
