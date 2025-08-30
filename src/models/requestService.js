const { prisma } = require("../config/database");

exports.createRequest = (data) => prisma.request.create({ data });

exports.getAllRequest = () =>
  prisma.request.findMany({ include: { attendance: true } });

exports.getRequestById = (id) =>
  prisma.request.findUnique({
    where: { id: Number(id) },
    include: { attendance: true },
  });
