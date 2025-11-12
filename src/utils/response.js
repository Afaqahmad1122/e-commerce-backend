/**
 * Standardized API response helpers
 */

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object} data - Response data
 */
export const sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} errors - Additional error details (optional)
 */
export const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};
