import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validator.middleware.js';
import {
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

export default router;
