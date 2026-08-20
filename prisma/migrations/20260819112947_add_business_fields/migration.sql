-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'PENDING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "description" TEXT;
