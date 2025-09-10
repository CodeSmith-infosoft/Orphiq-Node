// src/utils/validation.js

// Email validation
const validateEmail = (email) => {
  if (!email) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please provide a valid email address";
  }

  if (email.length > 255) {
    return "Email must be less than 255 characters";
  }

  return null;
};

// Password validation
const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (password.length > 128) {
    return "Password must be less than 128 characters";
  }

  return null;
};

const validatePhoneNumber = (phoneNumber) => {
  // Simple regex for Indian phone numbers: starts with +91 or 0 or nothing, then 10 digits
  const phoneRegex = /^[6-9]\d{9}$/;

  if (!phoneRegex.test(phoneNumber)) {
    return "Invalid phone number format";
  }

  return null; // no error
};

// Name validation
const validateName = (name, fieldName) => {
  if (name && name.length > 100) {
    return `${fieldName} must be less than 100 characters`;
  }

  if (name && !/^[a-zA-Z\s'-]+$/.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }

  return null;
};

// Registration validation
const validateRegistration = ({
  email,
  password,
  firstName,
  lastName,
  phoneNumber,
  position,
  salary,
  aadharNumber,
  panNumber,
  birthDate,
}) => {
  // Email validation
  const emailError = validateEmail(email);
  if (emailError) return emailError;

  // Password validation
  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;

  // First name validation (optional)
  if (firstName) {
    const firstNameError = validateName(firstName, "First name");
    if (firstNameError) return firstNameError;
  }

  // Last name validation (optional)
  if (lastName) {
    const lastNameError = validateName(lastName, "Last name");
    if (lastNameError) return lastNameError;
  }

  // Phone number validation (optional)
  if (phoneNumber) {
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) return phoneError;
  }

  // Position validation (optional, just check string)
  if (position) {
    if (typeof position !== "string" || position.trim().length === 0) {
      return "Position must be a non-empty string";
    }
  }

  // Salary validation (optional)
  if (salary !== undefined) {
    if (typeof salary !== "number" || salary < 0) {
      return "Salary must be a non-negative number";
    }
  }

  // Aadhaar validation (optional, pattern check)
  if (aadharNumber) {
    const aadhaarPattern = /^\d{4}\d{4}\d{4}$/; // example pattern: 1234-5678-9012
    if (!aadhaarPattern.test(aadharNumber)) {
      return "Aadhaar number must be in the format XXXXXXXXXXXX";
    }
  }

  // PAN validation (optional, pattern check)
  if (panNumber) {
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // example PAN format
    if (!panPattern.test(panNumber)) {
      return "PAN number must be valid (e.g., ABCDE1234F)";
    }
  }

  // Birth date validation (optional)
  if (birthDate) {
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      return "Birth date must be a valid date";
    }
  }

  return null;
};

// Login validation
const validateLogin = ({ email, password }) => {
  // Email validation
  const emailError = validateEmail(email);
  if (emailError) return emailError;

  // Password validation (basic check for login)
  if (!password) {
    return "Password is required";
  }

  if (password.length > 128) {
    return "Password is too long";
  }

  return null;
};

// Validate user ID
const validateUserId = (userId) => {
  if (!userId) {
    return "User ID is required";
  }

  if (!Number.isInteger(parseInt(userId)) || parseInt(userId) <= 0) {
    return "Invalid user ID";
  }

  return null;
};

// Validate update profile data
const validateProfileUpdate = ({ firstName, lastName }) => {
  if (firstName !== undefined) {
    const firstNameError = validateName(firstName, "First name");
    if (firstNameError) return firstNameError;
  }

  if (lastName !== undefined) {
    const lastNameError = validateName(lastName, "Last name");
    if (lastNameError) return lastNameError;
  }

  return null;
};

// Sanitize input (remove extra whitespace, prevent XSS)
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  return str
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .slice(0, 1000); // Limit length to prevent DoS
};

// Validate and sanitize email
const sanitizeEmail = (email) => {
  if (!email) return "";
  return sanitizeString(email.toLowerCase());
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateRegistration,
  validateLogin,
  validateUserId,
  validateProfileUpdate,
  sanitizeString,
  sanitizeEmail,
};
