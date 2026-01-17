import { asyncHandler } from '../utils/async-handler.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import {
  sendMail,
  emailVerificationMailContent,
  forgotPasswordMailContent,
} from '../utils/mail.js';
import { createHash } from 'node:crypto';
import jwt from 'jsonwebtoken';

const cookieOptions = Object.freeze({
  httpOnly: true,
  secure: true,
});

const userSelectFields =
  '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry';

const generateAccessAndRefreshToken = async (userId) => {
  const user = await getUserById(userId);

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const getUserById = async (userId) => {
  if (!userId) throw new ApiError(400, 'Unauthorized request');
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const sendVerificationEmail = async (user, req) => {
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendMail({
    email: user.email,
    subject: 'Email Verification',
    mailgenContent: emailVerificationMailContent(
      user.username,
      `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${unHashedToken}`,
    ),
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, fullName } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new ApiError(409, 'User with given email or username already exists');
  }

  const newUser = await User.create({
    email,
    username,
    password,
    isEmailVerified: false,
    fullName,
  });
  await sendVerificationEmail(newUser, req);

  const createdUser = await User.findById(newUser._id).select(userSelectFields);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        'User registered successfully and sent verification email.',
        createdUser,
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

  if (!email && !username) {
    throw new ApiError(400, 'Email or username is required');
  }

  const user = await User.findOne(email ? { email } : { username });

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  return res
    .status(200)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .cookie('accessToken', accessToken, cookieOptions)
    .json(
      new ApiResponse(200, 'Login successful', {
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
      }),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  await getUserById(userId);
  await User.findByIdAndUpdate(userId, { $set: { refreshToken: null } });

  res
    .status(200)
    .clearCookie('refreshToken', cookieOptions)
    .clearCookie('accessToken', cookieOptions)
    .json(new ApiResponse(200, 'Logout successful'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user?._id);
  const userData = await User.findById(user._id).select(userSelectFields);

  res
    .status(200)
    .json(new ApiResponse(200, 'User retrieved successfully', userData));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await getUserById(req.user?._id);

  if (!(await user.isPasswordMatch(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, 'Password changed successfully', null));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken)
    throw new ApiError(400, 'Refresh token is required');

  jwt.verify(
    incommingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) throw new ApiError(401, 'Invalid refresh token');

      const user = await getUserById(decoded._id);

      if (user.refreshToken !== incommingRefreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id,
      );

      res
        .status(200)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .cookie('accessToken', accessToken, cookieOptions)
        .json(
          new ApiResponse(200, 'Token refreshed successfully', {
            accessToken,
            refreshToken,
          }),
        );
    },
  );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) throw new ApiError(400, 'Verification token is required');

  const hashedToken = createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, 'Invalid or expired verification token');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, 'Email verified successfully', {
      isEmailVerified: true,
    }),
  );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User with given email not found');

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendMail({
    email: user.email,
    subject: 'Password Reset',
    mailgenContent: forgotPasswordMailContent(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
  });

  res
    .status(200)
    .json(new ApiResponse(200, 'Password reset email sent successfully', null));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, 'Invalid or expired password reset token');

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, 'Password reset successfully', {
      isPasswordReset: true,
    }),
  );
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user?._id);
  if (user.isEmailVerified)
    throw new ApiError(409, 'Email is already verified');

  await sendVerificationEmail(user, req);

  res.status(200).json(
    new ApiResponse(200, 'Verification email sent successfully', {
      isEmailVerified: false,
    }),
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  changePassword,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendEmailVerification,
};
