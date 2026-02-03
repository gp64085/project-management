import { asyncHandler } from '../utils/async-handler.js';
import { Project } from '../models/project.model.js';
import { ProjectMember } from '../models/projectmember.model.js';
import { Types } from 'mongoose';
import { AvailableUserRoles, UserRolesEnum } from '../utils/constants.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';
import { sendOk, sendCreated } from '../utils/response-helper.js';

const { ObjectId } = Types;

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: { user: new ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'projectDetails',
        pipeline: [
          {
            $lookup: {
              from: 'projectmembers',
              localField: '_id',
              foreignField: 'project',
              as: 'projectMembers',
            },
          },
          {
            $addFields: {
              members: {
                $size: '$projectMembers',
              },
            },
          },
        ],
      },
    },
    {
      $unwind: '$projectDetails',
    },
    {
      $project: {
        project: {
          _id: '$projectDetails._id',
          name: '$projectDetails.name',
          description: '$projectDetails.description',
          members: '$projectDetails.members',
          createdBy: '$projectDetails.createdBy',
          createdAt: '$projectDetails.createdAt',
        },
        role: 1,
        _id: 0,
      },
    },
  ]);

  return sendOk(res, 'Projects retrieved successfully', projects);
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) throw new ApiError(404, 'Project not found');

  return sendOk(res, 'Project retrieved successfully', project);
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const session = await Project.startSession();

  let project;

  try {
    await session.withTransaction(async () => {
      [project] = await Project.create(
        [
          {
            name,
            description,
            createdBy: new ObjectId(req.user._id),
          },
        ],
        { session },
      );

      await ProjectMember.create(
        [
          {
            project: new ObjectId(project._id),
            user: new ObjectId(req.user._id),
            role: UserRolesEnum.ADMIN,
          },
        ],
        { session },
      );
    });
  } finally {
    session.endSession();
  }

  if (!project) {
    throw new ApiError(500, 'Failed to create project');
  }

  return sendCreated(res, 'Project created successfully', project);
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    { new: true },
  );

  if (!project) throw new ApiError(404, 'Project not found');

  return sendOk(res, 'Project updated successfully', project);
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByIdAndDelete(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  await ProjectMember.deleteMany({ project: new ObjectId(projectId) });

  return sendOk(res, 'Project deleted successfully');
});

const addProjectMemberToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { email, role } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User not found');

  await ProjectMember.findOneAndUpdate(
    {
      project: new ObjectId(projectId),
      user: new ObjectId(user._id),
    },
    {
      project: new ObjectId(projectId),
      user: new ObjectId(user._id),
      role,
    },
    { new: true, upsert: true },
  );

  return sendOk(res, 'Project member added successfully');
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const projectMembers = await ProjectMember.aggregate([
    {
      $match: { project: new ObjectId(projectId) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        userDetails: {
          $arrayElemAt: ['$userDetails', 0],
        },
      },
    },
    {
      $project: {
        project: 1,
        userDetails: 1,
        role: 1,
        _id: 0,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return sendOk(res, 'Project members retrieved successfully', projectMembers);
});

const updateProjectMemberRole = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;

  const { newRole } = req.body;

  if (!AvailableUserRoles.includes(newRole)) {
    throw new ApiError(400, 'Invalid role');
  }

  const projectMember = await ProjectMember.findOneAndUpdate(
    {
      project: new ObjectId(projectId),
      user: new ObjectId(memberId),
    },
    {
      role: newRole,
    },
    { new: true },
  );

  if (!projectMember) throw new ApiError(404, 'Project member not found');

  return sendOk(res, 'Project member role updated successfully', projectMember);
});

const removeProjectMember = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;

  const projectMember = await ProjectMember.findOneAndDelete({
    project: new ObjectId(projectId),
    user: new ObjectId(memberId),
  });
  if (!projectMember) throw new ApiError(404, 'Project member not found');

  return sendOk(res, 'Project member removed successfully');
});

export {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMemberToProject,
  getProjectMembers,
  updateProjectMemberRole,
  removeProjectMember,
};
