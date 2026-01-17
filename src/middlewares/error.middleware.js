import { ApiResponse } from '../utils/api-response.js';

/**
 * Global error handler middleware.
 * @param {Error} err - The error object
 * @param {Request} req - The express request object
 * @param {Response} res - The express response object
 * @param {NextFunction} next - The next function to be called in the middleware chain
 * @returns {ApiResponse} - The JSON response with error details
 */
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  const errors = err.errors || [];

  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, message, null, errors));
};

export { errorHandler };
