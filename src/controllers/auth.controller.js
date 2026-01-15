import { asyncHandler } from '../utils/async-handler.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { sendMail, emailVerificationMailContent } from '../utils/mail.js';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', []);
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Failed to generate tokens', [error.message]);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, fullName } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    return res
      .status(409)
      .json(
        new ApiError(409, 'User with given email or username already exists'),
      );
  }

  const newUser = await User.create({
    email,
    username,
    password,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    newUser.generateTemporaryToken();

  newUser.emailVerificationToken = hashedToken;
  newUser.emailVerificationTokenExpiry = tokenExpiry;

  await newUser.save({ validateBeforeSave: false });

  await sendMail({
    email: newUser?.email,
    subject: 'Email Verification',
    mailgenContent: emailVerificationMailContent(
      newUser.username,
      `${req.protocol}://${req.get('host')}/api/v1/users/verify-email?token=${unHashedToken}`,
    ),
  });

  const createdUser = await User.findById(newUser._id).select(
    '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry',
  );

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while creating user');
  }

  return res
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
    return res.status(401).json(new ApiError(401, 'Invalid credentials'));
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  return res
    .status(200)
    .cookie('refreshToken', refreshToken, options)
    .cookie('accessToken', accessToken, options)
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

export { registerUser, loginUser };
