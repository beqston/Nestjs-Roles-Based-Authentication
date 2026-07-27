-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'moderator', 'manager', 'admin');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user';
