import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';

export const verifyJwt = async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken || req.headers.authorization?.split(' ')?.[1];

  if (!accessToken) {
    throw new ApiError(401, 'Unauthorized: No access token provided');
  }

  try {
    const decoded = jwt.verify(accessToken, config.jwt.secret);
    const user = await User.findById(decoded?.userId).select(
      '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry',
    );

    if (!user) {
      throw new ApiError(401, 'Unauthorized: Invalid access token');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Unauthorized: Invalid access token');
  }
};
