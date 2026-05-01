-- AlterTable
ALTER TABLE "Initiative" ADD COLUMN "readinessJson" JSONB;
ALTER TABLE "Initiative" ADD COLUMN "confidenceScore" REAL NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BusinessCaseSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "label" TEXT,
    "input" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessCaseSnapshot_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessCaseSnapshot_initiativeId_version_key" ON "BusinessCaseSnapshot"("initiativeId", "version");

-- CreateIndex
CREATE INDEX "BusinessCaseSnapshot_initiativeId_createdAt_idx" ON "BusinessCaseSnapshot"("initiativeId", "createdAt");
