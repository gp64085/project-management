import { validationResult } from 'express-validator';
import { ApiError } from '../utils/api-error.js';

/**
 * Validates the request body against defined validation rules.
 * If the request body is invalid, an ApiError is thrown with a status code of 422.
 * @param {Request} req - The express request object
 * @param {Response} res - The express response object
 * @param {NextFunction} next - The next function to be called in the middleware chain
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = {};
  errors.array().map((err) => (extractedErrors[err.path] = err.msg));

  return res
    .status(422)
    .json(new ApiError(422, 'Validation failed', extractedErrors));
};
