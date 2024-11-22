-- DropForeignKey
ALTER TABLE `Cart` DROP FOREIGN KEY `Cart_orderById_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_orderById_fkey`;

-- AlterTable
ALTER TABLE `Cart` MODIFY `orderById` INTEGER NULL;

-- AlterTable
ALTER TABLE `Order` MODIFY `orderById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_orderById_fkey` FOREIGN KEY (`orderById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_orderById_fkey` FOREIGN KEY (`orderById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
