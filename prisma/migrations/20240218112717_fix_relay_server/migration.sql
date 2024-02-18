-- CreateEnum
CREATE TYPE "RelayServerStatus" AS ENUM ('SENT', 'FAILED', 'ACCEPTED');

-- AlterTable
ALTER TABLE "RelayServer" ADD COLUMN     "status" "RelayServerStatus" NOT NULL DEFAULT 'SENT';
