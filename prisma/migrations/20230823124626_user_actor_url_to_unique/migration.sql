/*
  Warnings:

  - A unique constraint covering the columns `[actorUrl]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_actorUrl_key" ON "User"("actorUrl");
