-- CreateTable
CREATE TABLE "Initiative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "phase" TEXT NOT NULL DEFAULT 'DISCOVERY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CostLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "oneTime" REAL NOT NULL DEFAULT 0,
    "annual" REAL NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockReason" TEXT,
    CONSTRAINT "CostLine_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BenefitLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "oneTime" REAL NOT NULL DEFAULT 0,
    "annual" REAL NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockReason" TEXT,
    CONSTRAINT "BenefitLine_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT NOT NULL,
    "optionType" TEXT NOT NULL,
    "optionName" TEXT NOT NULL,
    "costScore" REAL NOT NULL DEFAULT 0,
    "benefitScore" REAL NOT NULL DEFAULT 0,
    "riskScore" REAL NOT NULL DEFAULT 0,
    "fitScore" REAL NOT NULL DEFAULT 0,
    "totalScore" REAL NOT NULL DEFAULT 0,
    "recommendation" TEXT NOT NULL DEFAULT '',
    "rationale" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Decision_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoadmapPhase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT NOT NULL,
    "phaseNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "lane" TEXT NOT NULL,
    "deliverables" TEXT NOT NULL DEFAULT '',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RoadmapPhase_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "oneLiner" TEXT NOT NULL,
    "defaultPhase" TEXT NOT NULL DEFAULT 'DISCOVERY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT,
    "actorType" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventSource" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditEvent_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "metadata" JSONB,
    "attemptedLockedMutation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIRun_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinancialLockConfirmation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aiRunId" TEXT NOT NULL,
    "lineType" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "previousValue" REAL NOT NULL,
    "proposedValue" REAL NOT NULL,
    "confirmedBy" TEXT NOT NULL,
    "confirmedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialLockConfirmation_aiRunId_fkey" FOREIGN KEY ("aiRunId") REFERENCES "AIRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Initiative_phase_idx" ON "Initiative"("phase");

-- CreateIndex
CREATE INDEX "CostLine_initiativeId_sortOrder_idx" ON "CostLine"("initiativeId", "sortOrder");

-- CreateIndex
CREATE INDEX "BenefitLine_initiativeId_sortOrder_idx" ON "BenefitLine"("initiativeId", "sortOrder");

-- CreateIndex
CREATE INDEX "Decision_initiativeId_idx" ON "Decision"("initiativeId");

-- CreateIndex
CREATE INDEX "RoadmapPhase_initiativeId_sortOrder_idx" ON "RoadmapPhase"("initiativeId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Template_slug_key" ON "Template"("slug");

-- CreateIndex
CREATE INDEX "AuditEvent_initiativeId_createdAt_idx" ON "AuditEvent"("initiativeId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_eventType_createdAt_idx" ON "AuditEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "AIRun_initiativeId_createdAt_idx" ON "AIRun"("initiativeId", "createdAt");

-- CreateIndex
CREATE INDEX "FinancialLockConfirmation_lineType_lineId_confirmedAt_idx" ON "FinancialLockConfirmation"("lineType", "lineId", "confirmedAt");
