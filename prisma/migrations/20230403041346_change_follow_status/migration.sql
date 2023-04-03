/*
  Warnings:

  - The values [RECEIVED] on the enum `FollowStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FollowStatus_new" AS ENUM ('SENT', 'FAILED', 'ACCEPTED');
ALTER TABLE "Follow" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Follow" ALTER COLUMN "status" TYPE "FollowStatus_new" USING ("status"::text::"FollowStatus_new");
ALTER TYPE "FollowStatus" RENAME TO "FollowStatus_old";
ALTER TYPE "FollowStatus_new" RENAME TO "FollowStatus";
DROP TYPE "FollowStatus_old";
ALTER TABLE "Follow" ALTER COLUMN "status" SET DEFAULT 'SENT';
COMMIT;
