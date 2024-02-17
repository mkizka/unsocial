-- CreateTable
CREATE TABLE "RelayServer" (
    "id" TEXT NOT NULL,
    "inboxUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelayServer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RelayServer_inboxUrl_key" ON "RelayServer"("inboxUrl");
