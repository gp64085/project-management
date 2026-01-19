export const UserRolesEnum = Object.freeze({
  ADMIN: 'admin',
  PROJECT_ADMIN: 'project_admin',
  MEMBER: 'member',
});

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const TaskStatusEnum = Object.freeze({
  TO_DO: 'to_do',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
});

export const AvailableTaskStatus = Object.values(TaskStatusEnum);
