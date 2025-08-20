-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
