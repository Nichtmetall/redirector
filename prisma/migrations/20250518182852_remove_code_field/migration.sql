/*
  Warnings:

  - The primary key for the `Redirect` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `code` on the `Redirect` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Redirect" DROP CONSTRAINT "Redirect_pkey",
DROP COLUMN "code",
ADD CONSTRAINT "Redirect_pkey" PRIMARY KEY ("am_id", "customerId");
