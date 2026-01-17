import { Router } from 'express';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  resendEmailVerification,
  verifyEmail,
  refreshToken,
  changePassword,
  resetPassword,
  forgotPassword,
} from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validator.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import {
  forgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
} from '../validators/index.js';

const router = Router();

router.post(
  '/register',
  userRegisterValidator(),
  validateRequest,
  registerUser,
);

router.post('/login', userLoginValidator(), validateRequest, loginUser);

router.get('/logout', verifyJwt, logoutUser);

router.get('/current-user', verifyJwt, getCurrentUser);

router.get('/verify-email/:token', verifyEmail);

router.post('/resend-email-verification', verifyJwt, resendEmailVerification);

router.post('/refresh-token', refreshToken);

router.post('/change-password', verifyJwt, changePassword);

router.post(
  '/forgot-password',
  forgotPasswordValidator(),
  validateRequest,
  forgotPassword,
);

router.post('/reset-password/:token', resetPassword);

export default router;
