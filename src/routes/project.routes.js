import { Router } from 'express';
import {
  validateProjectPermission,
  verifyJwt,
} from '../middlewares/auth.middleware.js';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMemberToProject,
  updateProjectMemberRole,
  removeProjectMember,
} from '../controllers/project.controller.js';
import {
  addMemberToProjectValidator,
  createProjectValidator,
} from '../validators/index.js';
import { validateRequest } from '../middlewares/validator.middleware.js';
import { AvailableUserRoles, UserRolesEnum } from '../utils/constants.js';

const router = Router();
router.use(verifyJwt);

router.get('/', getProjects);

router.post('/', createProjectValidator(), validateRequest, createProject);

router.put(
  '/:projectId',
  validateProjectPermission([UserRolesEnum.ADMIN]),
  createProjectValidator(),
  validateRequest,
  updateProject,
);

router.delete(
  '/:projectId',
  validateProjectPermission([UserRolesEnum.ADMIN]),
  deleteProject,
);

router.get(
  '/:projectId',
  validateProjectPermission(AvailableUserRoles),
  getProjectById,
);

router.get(
  '/:projectId/members',
  validateProjectPermission(AvailableUserRoles),
  getProjectMembers,
);

router.post(
  '/:projectId/members',
  validateProjectPermission([UserRolesEnum.ADMIN]),
  addMemberToProjectValidator(),
  validateRequest,
  addProjectMemberToProject,
);

router.put(
  '/:projectId/members/:memberId',
  validateProjectPermission([UserRolesEnum.ADMIN]),
  updateProjectMemberRole,
);

router.delete(
  '/:projectId/members/:memberId',
  validateProjectPermission([UserRolesEnum.ADMIN]),
  removeProjectMember,
);

export default router;
