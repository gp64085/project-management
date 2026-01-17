import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

const healthCheck = asyncHandler((req, res) => {
  res.status(200).json(new ApiResponse(200, 'Server is healthy', null));
});

export { healthCheck };
