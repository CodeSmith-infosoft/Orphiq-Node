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
// exports.updateLeave = (id, data) =>
//   prisma.leave.update({ where: { id: parseInt(id) }, data });
exports.updateLeave = async (id, data) => {
  // return prisma.$transaction(async (tx) => {
  //   // Get old leave
  //   const oldLeave = await tx.leave.findUnique({
  //     where: { id: Number(id) },
  //   });

  //   if (!oldLeave) throw new Error("Leave not found");

  //   // Update leave
  //   const updatedLeave = await tx.leave.update({
  //     where: { id: Number(id) },
  //     data,
  //   });

  //   // ✅ Check if leave type affects balance
  //   const isCasual = oldLeave.leaveType === "Casual Leave";
  //   const isSick = oldLeave.leaveType === "Sick Leave";

  //   if (isCasual || isSick) {
  //     const days =
  //       Math.ceil(
  //         (new Date(oldLeave.endDate).getTime() -
  //           new Date(oldLeave.startDate).getTime()) /
  //           (1000 * 60 * 60 * 24)
  //       ) + 1;

  //     // Case 1: Pending/Rejected → Approved (Deduct balance)
  //     if (
  //       (oldLeave.status === "Pending" || oldLeave.status === "Rejected") &&
  //       data.status === "Approved"
  //     ) {
  //       await tx.user.update({
  //         where: { id: oldLeave.employeeId },
  //         data: isCasual
  //           ? { casualLeaves: { decrement: days } }
  //           : { sickLeaves: { decrement: days } },
  //       });
  //     }

  //     // Case 2: Approved → Rejected/Pending (Return balance)
  //     if (
  //       oldLeave.status === "Approved" &&
  //       (data.status === "Rejected" || data.status === "Pending")
  //     ) {
  //       await tx.user.update({
  //         where: { id: oldLeave.employeeId },
  //         data: isCasual
  //           ? { casualLeaves: { increment: days } }
  //           : { sickLeaves: { increment: days } },
  //       });
  //     }
  //   }

  //   return updatedLeave;
  // });

  return prisma.$transaction(async (tx) => {
    // Get old leave
    const oldLeave = await tx.leave.findUnique({
      where: { id: Number(id) },
    });

    if (!oldLeave) throw new Error("Leave not found");

    // Update leave
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

      // Case 1: Pending/Rejected → Approved
      if (
        (oldLeave.status === "Pending" || oldLeave.status === "Rejected") &&
        data.status === "Approved"
      ) {
        await adjustBalance(tx, oldLeave.employeeId, isCasual, -newDays);
      }

      // Case 2: Approved → Rejected/Pending (restore full oldDays)
      if (
        oldLeave.status === "Approved" &&
        (data.status === "Rejected" || data.status === "Pending")
      ) {
        await adjustBalance(tx, oldLeave.employeeId, isCasual, +oldDays);
      }

      // Case 3: Approved → Approved but date changed (adjust difference)
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
