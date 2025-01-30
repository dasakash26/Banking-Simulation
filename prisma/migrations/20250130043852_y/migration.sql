/*
  Warnings:

  - The values [income] on the enum `AccountType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountType_new" AS ENUM ('SAVINGS', 'CURRENT', 'SALARY', 'DEMAT', 'NRI', 'PPF', 'FD', 'RD', 'LOAN');
ALTER TABLE "BankAccount" ALTER COLUMN "type" TYPE "AccountType_new" USING ("type"::text::"AccountType_new");
ALTER TYPE "AccountType" RENAME TO "AccountType_old";
ALTER TYPE "AccountType_new" RENAME TO "AccountType";
DROP TYPE "AccountType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "EmploymentType" ADD VALUE 'UNEMPLOYED';
