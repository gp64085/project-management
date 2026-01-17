import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';

export const verifyJwt = async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken || req.headers.authorization?.split(' ')?.[1];

  if (!accessToken) {
    throw new ApiError(401, 'Unauthorized', ['No access token provided']);
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded?._id).select(
      '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry',
    );

    if (!user) {
      throw new ApiError(401, 'Unauthorized', ['User not found']);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Unauthorized: Access token has expired', []);
    }
    throw new ApiError(401, 'Unauthorized', ['Invalid access token']);
  }
};
