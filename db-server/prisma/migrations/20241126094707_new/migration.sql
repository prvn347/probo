/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Market` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `Market` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `startTime` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Market" DROP CONSTRAINT "Market_categoryId_fkey";

-- DropIndex
DROP INDEX "Market_categoryId_key";

-- AlterTable
ALTER TABLE "Market" DROP COLUMN "categoryId",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Category";

-- CreateIndex
CREATE UNIQUE INDEX "Market_id_key" ON "Market"("id");
