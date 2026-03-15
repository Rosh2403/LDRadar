-- CreateTable
CREATE TABLE "Briefing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summary" TEXT NOT NULL,
    "patterns" TEXT NOT NULL,
    "hotSectors" TEXT NOT NULL,
    "activeLPs" TEXT NOT NULL,
    "watchList" TEXT NOT NULL,
    "findingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
