import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://placehold.co/200x200`,
        localPath: '',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordTokenExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationTokenExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving the user model
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordMatch = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email, username: this.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ userId: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = randomBytes(20).toString('hex');

  const hashedToken = createHash('sha256').update(unHashedToken).digest('hex');

  const tokenExpiry = Date.now() + 20 * 60 * 1000; // Token valid for 20 minutes

  return {
    unHashedToken,
    hashedToken,
    tokenExpiry,
  };
};

export const User = model('User', userSchema);
