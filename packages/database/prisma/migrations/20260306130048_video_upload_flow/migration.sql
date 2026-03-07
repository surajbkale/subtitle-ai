-- AlterEnum
ALTER TYPE "VideoStatus" ADD VALUE 'UPLOADING';

-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "status" DROP DEFAULT;
