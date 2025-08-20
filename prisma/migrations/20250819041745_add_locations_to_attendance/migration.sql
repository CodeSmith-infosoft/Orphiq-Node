/*
  Warnings:

  - The `end_date` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "break_in_locations" TEXT[],
ADD COLUMN     "break_out_locations" TEXT[],
ADD COLUMN     "clock_in_locations" TEXT[],
ADD COLUMN     "clock_out_locations" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "end_date",
ADD COLUMN     "end_date" TIMESTAMP(3);
