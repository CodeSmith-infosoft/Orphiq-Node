-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "work_date" TIMESTAMP(3) NOT NULL,
    "clock_in_times" TIMESTAMP(3)[],
    "clock_out_times" TIMESTAMP(3)[],
    "break_in_times" TIMESTAMP(3)[],
    "break_out_times" TIMESTAMP(3)[],
    "total_work_minutes" INTEGER,
    "total_break_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);
