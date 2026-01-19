import { body } from 'express-validator';
import { AvailableUserRoles } from '../utils/constants.js';

const userRegisterValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email address'),
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLowercase()
      .withMessage('Username must be in lowercase')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('fullName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ min: 3 })
      .withMessage('Full name must be at least 3 characters long'),
  ];
};

const userLoginValidator = () => {
  return [
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Invalid email address'),
    body('username')
      .optional()
      .trim()
      .isLowercase()
      .withMessage('Username must be in lowercase'),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ];
};

const forgotPasswordValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email address'),
  ];
};

const userResetPasswordValidator = () => {
  return [
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ];
};

const createProjectValidator = () => {
  return [
    body('name').notEmpty().withMessage('Project name is required').trim(),
    body('description').optional().trim(),
  ];
};

const addMemberToProjectValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email address'),
    body('role')
      .trim()
      .notEmpty()
      .withMessage('Role is required')
      .isIn(AvailableUserRoles)
      .withMessage('Invalid role'),
  ];
};

export {
  userRegisterValidator,
  userLoginValidator,
  forgotPasswordValidator,
  userResetPasswordValidator,
  createProjectValidator,
  addMemberToProjectValidator,
};
