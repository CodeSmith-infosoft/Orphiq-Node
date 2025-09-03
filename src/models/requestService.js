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
