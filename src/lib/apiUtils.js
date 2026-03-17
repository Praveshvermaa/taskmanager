import { verifyToken, getTokenFromCookies } from './auth';

/**
 * Extract and verify user from request cookies
 * @param {Request} request
 * @returns {string|null} userId or null
 */
export function getUserFromRequest(request) {
  const token = getTokenFromCookies(request);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return decoded.userId;
}

/**
 * Sanitize string input - strip HTML tags and trim
 * @param {string} str
 * @returns {string}
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')       // Remove HTML tags
    .replace(/[<>]/g, '')          // Remove remaining angle brackets
    .replace(/javascript:/gi, '')  // Remove javascript: protocols
    .replace(/on\w+=/gi, '')       // Remove event handlers
    .trim();
}

/**
 * Validate task input data
 * @param {object} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTask(data) {
  const errors = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.trim().length > 100) {
    errors.push('Title must be at most 100 characters');
  }

  if (data.description && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  } else if (data.description && data.description.trim().length > 500) {
    errors.push('Description must be at most 500 characters');
  }

  if (data.status && !['todo', 'in-progress', 'done'].includes(data.status)) {
    errors.push('Status must be todo, in-progress, or done');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

/**
 * Create a standardized API error response
 * @param {string} message
 * @param {number} status
 * @returns {Response}
 */
export function errorResponse(message, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

/**
 * Create a standardized API success response
 * @param {object} data
 * @param {number} status
 * @returns {Response}
 */
export function successResponse(data, status = 200) {
  return Response.json({ success: true, ...data }, { status });
}
