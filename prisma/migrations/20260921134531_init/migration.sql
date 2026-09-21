-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('PENDING', 'BOUGHT', 'SKIPPED');

-- CreateEnum
CREATE TYPE "SavingGoal" AS ENUM ('IKE', 'IKZE', 'INVESTMENTS', 'SAVINGS', 'OTHER');

-- CreateTable
CREATE TABLE "PurchaseDecision" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productUrl" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "coolingOffDays" INTEGER NOT NULL DEFAULT 7,
    "decisionDate" TIMESTAMP(3) NOT NULL,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saving" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "goal" "SavingGoal" NOT NULL,
    "decisionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Saving_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Saving_decisionId_key" ON "Saving"("decisionId");

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "PurchaseDecision"("id") ON DELETE CASCADE ON UPDATE CASCADE;
