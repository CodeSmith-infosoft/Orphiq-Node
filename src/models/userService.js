const bcrypt = require("bcryptjs");
const { prisma } = require("../config/database");

module.exports = {
  createUser: async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        position: data.position || null,
        salary: data.salary || null,
        aaddharNo: data.aaddharNo || null,
        panNo: data.panNo || null,
        birthDate: data.birthDate || null,
        isAdmin: data.isAdmin || false,
        department: data.department || null,
        employeeId: data.employeeId, // required, no update
        joiningDate: data.joiningDate, // required, no update
        endDate: null, // new users no endDate
      },
    });
  },

  findByEmail: async (email) => {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), isActive: true },
    });
  },

  findByEmployeeId: async (employeeId) => {
    return prisma.user.findFirst({
      where: { employeeId },
    });
  },

  findById: async (id) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  updateProfile: async (id, data) => {
    // prevent update of employeeId and joiningDate explicitly
    if (data.employeeId) delete data.employeeId;
    if (data.joiningDate) delete data.joiningDate;

    return prisma.user.update({
      where: { id },
      data,
    });
  },

  deactivateUser: async (id) => {
    return prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        endDate: new Date(),
      },
    });
  },

  verifyPassword: async (password, hashedPassword) => {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error("Password verification failed");
    }
  },
};
