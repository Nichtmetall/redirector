-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "am_id" TEXT NOT NULL,
    "empfehlungsgeber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("code","customerId")
);

-- AddForeignKey
ALTER TABLE "Redirect" ADD CONSTRAINT "Redirect_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
