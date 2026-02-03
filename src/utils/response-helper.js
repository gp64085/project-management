import { ApiResponse } from './api-response.js';

export const sendSuccess = (res, statusCode = 200, message, data = null) => {
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, message, data));
};

export const sendCreated = (res, message, data = null) => {
  return sendSuccess(res, 201, message, data);
};

export const sendOk = (res, message, data = null) => {
  return sendSuccess(res, 200, message, data);
};
