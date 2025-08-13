// src/models/attendanceService.js
const { prisma } = require("../config/database");

module.exports = {
  // Create today's attendance record if not exists
  createOrGetToday: async (employeeId) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let record = await prisma.attendance.findFirst({
      where: {
        employeeId,
        workDate: todayStart,
      },
    });

    if (!record) {
      record = await prisma.attendance.create({
        data: {
          employeeId,
          workDate: todayStart,
          clockInTimes: [],
          clockOutTimes: [],
          breakInTimes: [],
          breakOutTimes: [],
          totalWorkMinutes: 0,
          totalBreakMinutes: 0,
        },
      });
    }

    return record;
  },

  // Push a clock-in timestamp
  addClockIn: async (id, time) => {
    return prisma.attendance.update({
      where: { id },
      data: {
        clockInTimes: { push: time },
      },
    });
  },

  // Push a clock-out timestamp
  addClockOut: async (id, time) => {
    return prisma.attendance.update({
      where: { id },
      data: {
        clockOutTimes: { push: time },
      },
    });
  },

  // Push break-in timestamp
  addBreakIn: async (id, time) => {
    return prisma.attendance.update({
      where: { id },
      data: {
        breakInTimes: { push: time },
      },
    });
  },

  // Push break-out timestamp
  addBreakOut: async (id, time) => {
    return prisma.attendance.update({
      where: { id },
      data: {
        breakOutTimes: { push: time },
      },
    });
  },

  // Update totals
  updateTotals: async (id, totalWorkMinutes, totalBreakMinutes) => {
    return prisma.attendance.update({
      where: { id },
      data: {
        totalWorkMinutes,
        totalBreakMinutes,
      },
    });
  },

  // Get attendance by date
  getByDate: async (employeeId, date) => {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    return prisma.attendance.findFirst({
      where: {
        employeeId,
        workDate: startDate,
      },
    });
  },

  // Get all attendance for employee
  getAllForEmployee: async (employeeId) => {
    return prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { workDate: "desc" },
    });
  },
};
