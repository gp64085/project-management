import { Router } from 'express';
import healthCheckRouter from './helthcheck.routes.js';
import authRouter from './auth.routes.js';
import projectRouter from './project.routes.js';

const router = Router();

router.use('/healthcheck', healthCheckRouter);
router.use('/auth', authRouter);
router.use('/projects', projectRouter);

export default router;
