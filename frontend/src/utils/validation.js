/**
 * Regex for standard email format validation
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a user's full name (20 to 60 characters)
 */
export const validateName = (name) => {
  if (!name) return 'Name is required.';
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return 'Name must be between 20 and 60 characters.';
  }
  return null;
};

/**
 * Validates a user's email format
 */
export const validateEmail = (email) => {
  if (!email) return 'Email is required.';
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address.';
  }
  return null;
};

/**
 * Validates password criteria:
 * - 8 to 16 characters
 * - At least one uppercase letter
 * - At least one special character
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
};
