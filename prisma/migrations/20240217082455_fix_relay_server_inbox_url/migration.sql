/*
  Warnings:

  - You are about to drop the column `userId` on the `RelayServer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[inboxUrl]` on the table `RelayServer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inboxUrl` to the `RelayServer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RelayServer" DROP CONSTRAINT "RelayServer_userId_fkey";

-- DropIndex
DROP INDEX "RelayServer_userId_key";

-- AlterTable
ALTER TABLE "RelayServer" DROP COLUMN "userId",
ADD COLUMN     "inboxUrl" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RelayServer_inboxUrl_key" ON "RelayServer"("inboxUrl");
