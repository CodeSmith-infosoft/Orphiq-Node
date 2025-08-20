const { prisma } = require("../config/database");

module.exports = {
  createHoliday: async (data) => {
    return prisma.holiday.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
  },

  allHoliday: async () => {
    return prisma.holiday.findMany();
  },

  updateHoliday: async (id, data) => {
    return prisma.holiday.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
  },

  deleteHoliday: async (id) => {
    return prisma.holiday.delete({
      where: { id: parseInt(id) },
    });
  },
};
