const { prisma } = require("../config/database");

exports.createRequest = (data) => prisma.request.create({ data });

exports.getAllRequest = () =>
  prisma.request.findMany({
    include: {
      attendance: {
        include: {
          user: true,
        },
      },
    },
  });

exports.getRequest = (userId) =>
  prisma.request.findMany({
    where: {
      attendance: {
        employeeId: userId, 
      },
    },
    include: {
      attendance: {
        include: {
          user: true,
        },
      },
    },
  });
