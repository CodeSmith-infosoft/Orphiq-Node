const { prisma } = require("../config/database");

exports.createLeave = (data) => prisma.leave.create({ data });
exports.allLeave = () =>
  prisma.leave.findMany({
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
exports.updateLeave = (id, data) =>
  prisma.leave.update({ where: { id: parseInt(id) }, data });
exports.deleteLeave = (id) =>
  prisma.leave.delete({ where: { id: parseInt(id) } });
