/*
  Warnings:

  - The `break_in_locations` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `break_out_locations` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `clock_in_locations` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `clock_out_locations` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "break_in_locations",
ADD COLUMN     "break_in_locations" JSONB,
DROP COLUMN "break_out_locations",
ADD COLUMN     "break_out_locations" JSONB,
DROP COLUMN "clock_in_locations",
ADD COLUMN     "clock_in_locations" JSONB,
DROP COLUMN "clock_out_locations",
ADD COLUMN     "clock_out_locations" JSONB;
