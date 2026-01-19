import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ProjectMember } from '../models/projectmember.model.js';

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

export const validateProjectPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    const projectMember = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
    });

    const userRole = projectMember?.role;
    req.user.role = userRole;

    if (!projectMember || (roles.length && !roles.includes(userRole))) {
      throw new ApiError(
        403,
        'You do not have permission to access this resource',
      );
    }

    next();
  });
};
