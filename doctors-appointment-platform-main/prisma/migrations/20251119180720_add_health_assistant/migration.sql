-- CreateTable
CREATE TABLE "HealthChat" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "messages" JSONB[],
    "symptoms" TEXT[],
    "recommendations" JSONB,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "urgencyLevel" TEXT NOT NULL DEFAULT 'low',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthChat_userId_idx" ON "HealthChat"("userId");

-- CreateIndex
CREATE INDEX "HealthChat_createdAt_idx" ON "HealthChat"("createdAt");

-- AddForeignKey
ALTER TABLE "HealthChat" ADD CONSTRAINT "HealthChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
