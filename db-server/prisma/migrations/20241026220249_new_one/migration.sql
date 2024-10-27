/*
  Warnings:

  - You are about to drop the column `filledQuantity` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `market_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the `_MarketToTrade` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[categoryId]` on the table `Market` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[marketId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `marketId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_market_id_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_user_id_fkey";

-- DropForeignKey
ALTER TABLE "_MarketToTrade" DROP CONSTRAINT "_MarketToTrade_A_fkey";

-- DropForeignKey
ALTER TABLE "_MarketToTrade" DROP CONSTRAINT "_MarketToTrade_B_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "filledQuantity",
DROP COLUMN "market_id",
DROP COLUMN "status",
DROP COLUMN "user_id",
ADD COLUMN     "filled_quantity" INTEGER,
ADD COLUMN     "marketId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "quantity";

-- DropTable
DROP TABLE "_MarketToTrade";

-- CreateIndex
CREATE UNIQUE INDEX "Market_categoryId_key" ON "Market"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_userId_key" ON "Order"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_marketId_key" ON "Order"("marketId");
