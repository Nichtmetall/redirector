-- CreateTable
CREATE TABLE "RedirectLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "redirectCode" TEXT NOT NULL,
    "redirectCustomerId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RedirectLog_redirectCode_redirectCustomerId_fkey" FOREIGN KEY ("redirectCode", "redirectCustomerId") REFERENCES "Redirect" ("code", "customerId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RedirectLog_redirectCode_redirectCustomerId_idx" ON "RedirectLog"("redirectCode", "redirectCustomerId");
