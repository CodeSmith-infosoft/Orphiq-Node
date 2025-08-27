const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const dayjs = require("dayjs");

// 📌 Create notice
const createNotice = async (data) => {
  const { heading, description, createdDate, endDate } = data;

  const isActive = dayjs(endDate).isBefore(dayjs(), "day") ? false : true;

  return prisma.notice.create({
    data: {
      heading,
      description,
      createdDate: new Date(createdDate),
      endDate: new Date(endDate),
      isActive,
    },
  });
};

// 📌 Get all notices and auto-update expired ones
const getNotices = async () => {
  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    notices.map(async (notice) => {
      const isExpired = dayjs(notice.endDate).isBefore(dayjs(), "day");
      if (notice.isActive && isExpired) {
        return prisma.notice.update({
          where: { id: notice.id },
          data: { isActive: false },
        });
      }
      return notice;
    })
  );
};

// 📌 Update notice
const updateNotice = async (id, data) => {
  const existing = await prisma.notice.findUnique({ where: { id: Number(id) } });
  if (!existing) return null;

  let isActive = existing.isActive;
  if (data.endDate) {
    isActive = dayjs(data.endDate).isBefore(dayjs(), "day") ? false : true;
  }

  return prisma.notice.update({
    where: { id: Number(id) },
    data: {
      heading: data.heading ?? existing.heading,
      description: data.description ?? existing.description,
      endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
      isActive,
    },
  });
};

// 📌 Delete notice
const deleteNotice = async (id) => {
  return prisma.notice.delete({ where: { id: Number(id) } });
};

module.exports = {
  createNotice,
  getNotices,
  updateNotice,
  deleteNotice,
};
