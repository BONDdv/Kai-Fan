-- DropForeignKey
ALTER TABLE `MenuOnCart` DROP FOREIGN KEY `MenuOnCart_menuId_fkey`;

-- AlterTable
ALTER TABLE `MenuOnCart` MODIFY `menuId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `MenuOnCart` ADD CONSTRAINT `MenuOnCart_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
