-- DropForeignKey
ALTER TABLE `MenuOnCart` DROP FOREIGN KEY `MenuOnCart_cartId_fkey`;

-- DropForeignKey
ALTER TABLE `MenuOnCart` DROP FOREIGN KEY `MenuOnCart_menuId_fkey`;

-- AddForeignKey
ALTER TABLE `MenuOnCart` ADD CONSTRAINT `MenuOnCart_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuOnCart` ADD CONSTRAINT `MenuOnCart_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
