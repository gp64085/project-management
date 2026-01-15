import { Router } from 'express';
import healthCheckRouter from './helthcheck.routes.js';

const router = Router();

router.use('/healthcheck', healthCheckRouter);

export default router;
