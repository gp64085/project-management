import rateLimit from 'express-rate-limit';

export default rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: process.env.RATE_LIMIT_PER_MINUTE || 50,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '1 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});
