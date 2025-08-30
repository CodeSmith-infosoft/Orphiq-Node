const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserService = require("../models/userService");
const { prisma } = require("../config/database");
const {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePassword,
  sanitizeEmail,
  sanitizeString,
} = require("../utils/validation");
const { successResponse, errorResponse } = require("../utils/responses");

const JWT_SECRET =
  process.env.JWT_SECRET || "your_jwt_secret_key_change_this_in_production";

const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: "refresh" }, JWT_SECRET, { expiresIn: "7d" });
};

const generateEmployeeId = async (firstName) => {
  const prefix = firstName.replace(/\s+/g, "").substring(0, 3).toUpperCase(); // first 3 letters uppercase
  let uniqueNumber;
  let employeeId;
  let exists;

  do {
    uniqueNumber = Math.floor(1000 + Math.random() * 9000); // random 4 digit number
    employeeId = prefix + uniqueNumber;
    exists = await UserService.findByEmployeeId(employeeId);
  } while (exists);

  return employeeId;
};

const register = async (req, res) => {
  try {
    // Allowed fields for registration
    const allowedFields = [
      "email",
      "password",
      "firstName",
      "lastName",
      "phoneNumber",
      "position",
      "salary",
      "aadharNumber",
      "panNumber",
      "birthDate",
      "isAdmin",
      "department",
      "joiningDate",
    ];

    // Build sanitized data object
    const userData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];
        if (field === "email") value = sanitizeEmail(value);
        else if (typeof value === "string") value = sanitizeString(value);
        if (field === "salary") value = Number(value);
        userData[field] = value;
      }
    });

    // Validate inputs
    const validationError = validateRegistration(userData);
    if (validationError) return errorResponse(res, validationError, 400);

    // Check if email already exists
    if (await UserService.findByEmail(userData.email)) {
      return errorResponse(res, "User already exists with this email", 400);
    }

    // Generate employeeId
    const employeeId = await generateEmployeeId(userData.firstName);

    // Create new user
    const user = await UserService.createUser({
      ...userData,
      birthDate: userData.birthDate ? new Date(userData.birthDate) : null,
      isAdmin: userData.isAdmin || false,
      employeeId,
      endDate: null,
    });

    // Generate tokens
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    return successResponse(
      res,
      {
        message: "User registered successfully",
        data: { token, refreshToken, user },
      },
      201
    );
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse(res, error.message || "Registration failed", 500);
  }
};

// const login = async (req, res) => {
//   try {
//     let { email, password } = req.body;
//     email = sanitizeEmail(email);

//     const validationError = validateLogin({ email, password });
//     if (validationError) return errorResponse(res, validationError, 400);

//     const user = await UserService.findByEmail(email, true);
//     if (!user || !user.isActive)
//       return errorResponse(res, "Invalid email or password", 401);

//     const isPasswordValid = await UserService.verifyPassword(
//       password,
//       user.password
//     );
//     if (!isPasswordValid && password !== user.password)
//       return errorResponse(res, "Invalid email or password", 401);

//     const token = generateToken(user.id, user.email);
//     const refreshToken = generateRefreshToken(user.id);

//     const { password: _, ...userWithoutPassword } = user;
//     return successResponse(res, {
//       message: "Login successful",
//       data: { token, refreshToken, user: userWithoutPassword },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return errorResponse(res, error.message || "Login failed", 500);
//   }
// };

const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = sanitizeEmail(email);

    const validationError = validateLogin({ email, password });
    if (validationError) return errorResponse(res, validationError, 400);

    const user = await UserService.findByEmail(email, true);
    if (!user || !user.isActive)
      return errorResponse(res, "Invalid email or password", 401);

    const isPasswordValid = await UserService.verifyPassword(
      password,
      user.password
    );
    if (!isPasswordValid && password !== user.password)
      return errorResponse(res, "Invalid email or password", 401);

    // 👇 Check if user already has an active session
    if (user.currentToken) {
      return errorResponse(
        res,
        "User already logged in on another device",
        403
      );
    }

    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    // 👇 Save token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { currentToken: token },
    });

    const { password: _, ...userWithoutPassword } = user;
    return successResponse(res, {
      message: "Login successful",
      data: { token, refreshToken, user: userWithoutPassword },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, error.message || "Login failed", 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      phoneNumber,
      position,
      salary,
      aadharNumber,
      panNumber,
      birthDate,
      isAdmin,
      department,
    } = req.body;

    firstName = sanitizeString(firstName);
    lastName = sanitizeString(lastName);
    phoneNumber = sanitizeString(phoneNumber);
    position = sanitizeString(position);
    aadharNumber = sanitizeString(aadharNumber);
    panNumber = sanitizeString(panNumber);
    department = sanitizeString(department);

    // Validate inputs for update (exclude employeeId, joiningDate)
    const validationError = validateProfileUpdate({
      firstName,
      lastName,
      phoneNumber,
      position,
      salary,
      aadharNumber,
      panNumber,
      birthDate,
      isAdmin,
      department,
    });
    if (validationError) return errorResponse(res, validationError, 400);

    // Prepare data object but exclude employeeId & joiningDate (cannot be updated)
    const updateData = {
      firstName,
      lastName,
      phoneNumber,
      position,
      salary,
      aadharNumber,
      panNumber,
      birthDate,
      isAdmin,
      department,
    };

    const user = await UserService.updateProfile(req.user.userId, updateData);

    return successResponse(res, {
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return errorResponse(res, error.message || "Failed to update profile", 500);
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const user = await UserService.findById(userId);
    if (!user) return errorResponse(res, "User not found", 404);

    // Allowed fields for update
    const allowedUpdateFields = [
      "firstName",
      "lastName",
      "phoneNumber",
      "position",
      "salary",
      "aadharNumber",
      "panNumber",
      "birthDate",
      "isAdmin",
      "department",
    ];

    // Sanitize & filter
    const updateData = { ...req.body };
    allowedUpdateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] =
          typeof req.body[field] === "string"
            ? sanitizeString(req.body[field])
            : req.body[field];
      }
    });

    console.log(updateData);

    // Validate
    const validationError = validateProfileUpdate(updateData);
    if (validationError) return errorResponse(res, validationError, 400);

    // Update in DB
    const updatedUser = await UserService.updateProfile(userId, updateData);

    return successResponse(res, {
      message: "Profile updated successfully",
      data: { updatedUser },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return errorResponse(res, error.message || "Failed to update profile", 500);
  }
};

const deactivateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // Set isActive to false and endDate to now
    const user = await UserService.deactivateUser(userId);

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, {
      message: "User deactivated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Deactivate user error:", error);
    return errorResponse(
      res,
      error.message || "Failed to deactivate user",
      500
    );
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await UserService.findById(req.user.id);
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, { data: { user } });
  } catch (error) {
    console.error("Get profile error:", error);
    return errorResponse(res, error.message || "Failed to fetch profile", 500);
  }
};

const getUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    const user = await UserService.findAll();
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, { user });
  } catch (error) {
    console.error("Get profile error:", error);
    return errorResponse(res, error.message || "Failed to fetch profile", 500);
  }
};

const logout = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { currentToken: null },
    });
    return successResponse(res, { message: "Logged out successfully" });
  } catch (err) {
    console.log(err)
    return errorResponse(res, "Logout failed", 500);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  deactivateUser,
  updateUser,
  getUsers,
  logout,
};
