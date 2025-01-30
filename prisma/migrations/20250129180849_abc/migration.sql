-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "mobile" DROP NOT NULL,
ALTER COLUMN "dob" DROP NOT NULL;
