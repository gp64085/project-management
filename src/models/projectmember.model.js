import { model, Schema } from 'mongoose';
import { AvailableUserRoles, UserRolesEnum } from '../utils/constants.js';

const projectMemberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.MEMBER,
    },
  },
  { timestamps: true },
);

// unique indexing on project and user
projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });

export const ProjectMember = model('ProjectMember', projectMemberSchema);
