import { asyncHandler } from '../utils/async-handler.js';
import { Project } from '../models/project.model.js';
import { ApiResponse } from '../utils/api-response.js';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

const getProjects = asyncHandler(async (req, res) => {
  const { user } = req;

  const projects = await Project.find({ owner: user._id });

  res
    .status(200)
    .json(new ApiResponse(200, 'Projects retrieved successfully', projects));
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { user } = req;

  const project = await Project.create({
    name,
    description,
    createdBy: new ObjectId(user._id),
  });

  res
    .status(201)
    .json(new ApiResponse(201, 'Project created successfully', project));
});
export { getProjects, createProject };
