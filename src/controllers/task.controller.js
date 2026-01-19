import { asyncHandler } from '../utils/async-handler.js';
import { Task } from '../models/task.model.js';
import { Types } from 'mongoose';
import { isValidObjectId } from 'mongoose';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { SubTask } from '../models/subtask.model.js';

const { ObjectId } = Types;

const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(projectId)) {
    throw new ApiError(400, 'Invalid project id');
  }

  const task = await Task.create({
    name,
    description,
    project: new ObjectId(projectId),
  });

  res.status(201).json(new ApiResponse(201, 'Task created successfully', task));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  await Task.findByIdAndDelete(taskId);

  res.status(200).json(new ApiResponse(200, 'Task deleted successfully', null));
});

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!isValidObjectId(projectId)) {
    throw new ApiError(400, 'Invalid project id');
  }

  const tasks = await Task.find({ project: new ObjectId(projectId) });

  res
    .status(200)
    .json(new ApiResponse(200, 'Tasks retrieved successfully', tasks));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, 'Task retrieved successfully', task));
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { name, description, status } = req.body;

  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      name,
      description,
      status,
    },
    { new: true },
  );

  res.status(200).json(new ApiResponse(200, 'Task updated successfully', task));
});

const createSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const subTask = await SubTask.create({
    title,
    description,
    completed: false,
    task: new ObjectId(taskId),
    createdBy: new ObjectId(req.user._id),
  });

  res
    .status(200)
    .json(new ApiResponse(200, 'Subtask created successfully', subTask));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { subtaskId } = req.params;
  const { title, description, completed } = req.body;

  const subTask = await SubTask.findByIdAndUpdate(
    subtaskId,
    {
      title,
      description,
      completed,
    },
    { new: true },
  );

  res
    .status(200)
    .json(new ApiResponse(200, 'Subtask updated successfully', subTask));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { subtaskId } = req.params;

  await SubTask.findByIdAndDelete(subtaskId);

  res
    .status(200)
    .json(new ApiResponse(200, 'Subtask deleted successfully', null));
});

export {
  createTask,
  deleteTask,
  getTasks,
  getTaskById,
  updateTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
};
