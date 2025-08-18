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
        aadharNumber: data.aadharNumber || null,
        panNumber: data.panNumber || null,
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

  findAll: async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        position: true,
        salary: true,
        aadharNumber: true,
        panNumber: true,
        birthDate: true,
        isAdmin: true,
        department: true,
        joiningDate: true,
        email: true,
        isActive: true
        // password is not selected → won't appear
      },
    });
  },

  updateProfile: async (id, data) => {
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
        endDate: new Date().toUTCString(),
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
