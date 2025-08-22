/*
  Warnings:

  - You are about to drop the column `clock_in_locations` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `clock_in_times` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `clock_out_locations` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `clock_out_times` on the `Attendance` table. All the data in the column will be lost.
  - Added the required column `clock_in_time` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clock_out_time` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "clock_in_locations",
DROP COLUMN "clock_in_times",
DROP COLUMN "clock_out_locations",
DROP COLUMN "clock_out_times",
ADD COLUMN     "clock_in_location" JSONB,
ADD COLUMN     "clock_in_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "clock_out_location" JSONB,
ADD COLUMN     "clock_out_time" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Screenshot" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "attendanceId" INTEGER,
    "image_path" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "screenshot_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Screenshot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Screenshot" ADD CONSTRAINT "Screenshot_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Screenshot" ADD CONSTRAINT "Screenshot_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
