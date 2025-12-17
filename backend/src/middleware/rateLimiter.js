// src/middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";

export const createLimiter = (options) => rateLimit({
  windowMs: options.windowMs || 60 * 1000, // 1 minute
  max: options.max || 60, // default 60 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
});
