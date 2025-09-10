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

exports.userLeave = (userId) =>
  prisma.leave.findMany({
    where: {
      employeeId: userId,
    },
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

exports.updateLeave = async (id, data) => {
  return prisma.$transaction(async (tx) => {
    const oldLeave = await tx.leave.findUnique({
      where: { id: Number(id) },
    });

    if (!oldLeave) throw new Error("Leave not found");

    const updatedLeave = await tx.leave.update({
      where: { id: Number(id) },
      data,
    });

    const isCasual = oldLeave.leaveType === "Casual Leave";
    const isSick = oldLeave.leaveType === "Sick Leave";

    if (isCasual || isSick) {
      const oldDays =
        Math.ceil(
          (new Date(oldLeave.endDate).getTime() -
            new Date(oldLeave.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      const newDays =
        Math.ceil(
          (new Date(updatedLeave.endDate).getTime() -
            new Date(updatedLeave.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      if (
        (oldLeave.status === "Pending" || oldLeave.status === "Rejected") &&
        data.status === "Approved"
      ) {
        await adjustBalance(tx, oldLeave.employeeId, isCasual, -newDays);
      }

      if (
        oldLeave.status === "Approved" &&
        (data.status === "Rejected" || data.status === "Pending")
      ) {
        await adjustBalance(tx, oldLeave.employeeId, isCasual, +oldDays);
      }

      if (oldLeave.status === "Approved" && data.status === "Approved") {
        const diff = newDays - oldDays;
        if (diff !== 0) {
          await adjustBalance(tx, oldLeave.employeeId, isCasual, -diff);
        }
      }
    }

    return updatedLeave;
  });
};

async function adjustBalance(tx, userId, isCasual, change) {
  const user = await tx.user.findUnique({ where: { id: userId } });

  const currentBalance = isCasual ? user.casualLeaves : user.sickLeaves;
  const newBalance = currentBalance + change;

  if (newBalance < 0) {
    throw new Error(
      `Insufficient ${
        isCasual ? "Casual" : "Sick"
      } Leaves. Current: ${currentBalance}, Required: ${Math.abs(change)}`
    );
  }

  await tx.user.update({
    where: { id: userId },
    data: isCasual
      ? { casualLeaves: { increment: change } }
      : { sickLeaves: { increment: change } },
  });
}
exports.deleteLeave = (id) =>
  prisma.leave.delete({ where: { id: parseInt(id) } });
