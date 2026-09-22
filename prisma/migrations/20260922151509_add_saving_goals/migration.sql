/*
  Warnings:

  - Made the column `userId` on table `PurchaseDecision` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('IKE', 'IKZE', 'INVESTMENTS', 'SAVINGS', 'EMERGENCY', 'TRAVEL', 'CREDIT', 'CUSTOM');

-- AlterTable
DELETE FROM "PurchaseDecision"
WHERE "userId" IS NULL;

ALTER TABLE "PurchaseDecision" 
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Saving" ADD COLUMN     "goalId" TEXT;

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GoalType" NOT NULL DEFAULT 'CUSTOM',
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Goal_userId_idx" ON "Goal"("userId");

-- CreateIndex
CREATE INDEX "Saving_goalId_idx" ON "Saving"("goalId");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
