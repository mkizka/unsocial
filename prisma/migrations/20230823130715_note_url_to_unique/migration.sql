/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Note` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Note_url_key" ON "Note"("url");
