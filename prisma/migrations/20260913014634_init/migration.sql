-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "gameType" TEXT NOT NULL,
    "gameName" TEXT,
    "stake" DECIMAL(20,8) NOT NULL,
    "payout" DECIMAL(20,8) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "multiplier" DECIMAL(20,8),
    "status" TEXT NOT NULL DEFAULT 'settled',
    "rawData" JSONB,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankrollSnapshot" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balance" DECIMAL(20,8) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',

    CONSTRAINT "BankrollSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bet_externalId_key" ON "Bet"("externalId");

-- CreateIndex
CREATE INDEX "Bet_timestamp_idx" ON "Bet"("timestamp");

-- CreateIndex
CREATE INDEX "Bet_gameType_idx" ON "Bet"("gameType");

-- CreateIndex
CREATE INDEX "Bet_sessionId_idx" ON "Bet"("sessionId");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

