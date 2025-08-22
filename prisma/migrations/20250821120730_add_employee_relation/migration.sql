/*
  Warnings:

  - The `clock_in_time` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `clock_out_time` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "clock_in_time",
ADD COLUMN     "clock_in_time" TIMESTAMP(3)[],
DROP COLUMN "clock_out_time",
ADD COLUMN     "clock_out_time" TIMESTAMP(3)[];
