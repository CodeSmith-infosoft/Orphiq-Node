-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" VARCHAR(100),
ADD COLUMN     "employee_id" VARCHAR(50),
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "joining_date" TIMESTAMP(3);
