import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

const healthCheck = asyncHandler((req, res) => {
  res.status(200).json(ApiResponse.success(null, 'Server is healthy'));
});

export { healthCheck };
