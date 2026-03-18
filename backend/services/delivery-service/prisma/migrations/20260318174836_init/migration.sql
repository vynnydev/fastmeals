-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('bicycle', 'motorcycle', 'car');

-- CreateTable
CREATE TABLE "delivery_persons" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "current_latitude" DECIMAL(10,8),
    "current_longitude" DECIMAL(11,8),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_persons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "delivery_persons_is_active_idx" ON "delivery_persons"("is_active");
