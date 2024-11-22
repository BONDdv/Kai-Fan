/*
  Warnings:

  - You are about to drop the column `tableId` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `tableId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `Table` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Cart` DROP FOREIGN KEY `Cart_tableId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_tableId_fkey`;

-- AlterTable
ALTER TABLE `Cart` DROP COLUMN `tableId`;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `tableId`;

-- DropTable
DROP TABLE `Table`;
