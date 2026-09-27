-- CreateEnum
CREATE TYPE "DosingSource" AS ENUM ('AUTONOMOUS_EC', 'AUTONOMOUS_PH', 'ML_BIASED', 'MANUAL_OVERRIDE');

-- CreateEnum
CREATE TYPE "PumpType" AS ENUM ('PH_DOWN', 'NUTRIENT_A', 'NUTRIENT_B');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('ACIDIC_CRASH', 'OSMOTIC_TOXICITY', 'LOW_WATER_LEVEL', 'BIOTIC_STRESS', 'DESYNC_WARNING');

-- CreateTable
CREATE TABLE "CropRecipe" (
    "id" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "targetPhMin" DOUBLE PRECISION NOT NULL DEFAULT 5.8,
    "targetPhMax" DOUBLE PRECISION NOT NULL DEFAULT 6.5,
    "targetEcMin" DOUBLE PRECISION NOT NULL DEFAULT 1.2,
    "targetEcMax" DOUBLE PRECISION NOT NULL DEFAULT 1.8,
    "ecCeiling" DOUBLE PRECISION NOT NULL DEFAULT 2.4,
    "minWaterLevel" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticReport" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL DEFAULT 'esp32_node_01',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT NOT NULL,
    "primaryLabel" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "severity" "SeverityLevel" NOT NULL DEFAULT 'MODERATE',
    "classProbabilities" JSONB NOT NULL,
    "actionTaken" TEXT,
    "cooldownActiveTill" TIMESTAMP(3),

    CONSTRAINT "DiagnosticReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DosingLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "DosingSource" NOT NULL,
    "pumpType" "PumpType" NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "rationale" TEXT NOT NULL,
    "mixingLockoutMin" INTEGER NOT NULL DEFAULT 10,
    "diagnosticReportId" TEXT,

    CONSTRAINT "DosingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemAlert" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertType" "AlertType" NOT NULL,
    "severity" "SeverityLevel" NOT NULL DEFAULT 'CRITICAL',
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "SystemAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CropRecipe_cropName_key" ON "CropRecipe"("cropName");

-- CreateIndex
CREATE INDEX "DiagnosticReport_deviceId_timestamp_idx" ON "DiagnosticReport"("deviceId", "timestamp");

-- CreateIndex
CREATE INDEX "DosingLog_timestamp_idx" ON "DosingLog"("timestamp");

-- CreateIndex
CREATE INDEX "DosingLog_pumpType_idx" ON "DosingLog"("pumpType");

-- CreateIndex
CREATE INDEX "SystemAlert_isResolved_timestamp_idx" ON "SystemAlert"("isResolved", "timestamp");

-- AddForeignKey
ALTER TABLE "DosingLog" ADD CONSTRAINT "DosingLog_diagnosticReportId_fkey" FOREIGN KEY ("diagnosticReportId") REFERENCES "DiagnosticReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
