import { asyncHandler } from '../utils/async-handler.js';
import { sendOk } from '../utils/response-helper.js';

const healthCheck = asyncHandler((req, res) => {
  sendOk(res, 'Server is healthy', null);
});

export { healthCheck };
