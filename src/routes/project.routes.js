import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import {
  createProject,
  getProjects,
} from '../controllers/project.controller.js';

const router = Router();

router.use(verifyJwt);

router.get('', getProjects);
router.post('', createProject);

export default router;
