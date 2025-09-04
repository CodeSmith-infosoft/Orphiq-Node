const { prisma } = require("../config/database");

module.exports = {
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

  addClockIn: async (id, time, location) => {
    return prisma.attendance.update({
      where: { id },
      data: {
        clockInTimes: { push: time },
        clockInLocations: { push: location },
      },
    });
  },

  addClockOut: async (id, time, location) => {
    return prisma.attendance.update({
      where: { id },
      data: {
        clockOutTimes: { push: time },
        clockOutLocations: { push: location },
      },
    });
  },

  addBreakIn: async (id, time, location) => {
    return prisma.attendance.update({
      where: { id },
      data: {
        breakInTimes: { push: time },
        breakInLocations: { push: location },
      },
    });
  },

  addBreakOut: async (id, time, location) => {
    return prisma.attendance.update({
      where: { id },
      data: {
        breakOutTimes: { push: time },
        breakOutLocations: { push: location },
      },
    });
  },

  updateTotals: async (id, totalWorkMinutes, totalBreakMinutes, overtime) => {
    return prisma.attendance.update({
      where: { id },
      data: {
        totalWorkMinutes,
        totalBreakMinutes,
        overtime
      },
    });
  },

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

  getAllForEmployee: async (employeeId) => {
    return prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { workDate: "desc" },
    });
  },

  updateAttendance: async (id, payload) => {
    return prisma.attendance.update({
      where: { id: Number(id) },
      data: payload,
    });
  },
};
