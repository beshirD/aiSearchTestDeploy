/*
  Warnings:

  - You are about to drop the `link` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `search` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "link" DROP CONSTRAINT "link_user_id_fkey";

-- DropForeignKey
ALTER TABLE "search" DROP CONSTRAINT "search_user_id_fkey";

-- DropTable
DROP TABLE "link";

-- DropTable
DROP TABLE "search";
