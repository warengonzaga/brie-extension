import type { IssuePriority, IssueStatus, IssueType } from '../constants';
import type { IProject } from './project.interface';
import type { ISpace } from './space.interface';
import type { IUser } from './user.interface';

export interface IIssue {
  assignee: IUser | null;
  assigneeId: string | null;
  reporter: IUser;
  reporterId: string;
  id: string;
  externalId: string;
  internalId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  dueAt: Date | null;
  summary: string;
  description: string | null;
  slug: string | null;
  customer: IUser;
  customerId: string;
  project: IProject;
  projectId: string;
  isFlagged: boolean;
  labels: any[];
  epicId: string | null;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority | null;
  spaceId: string;
  space: ISpace;
  notes?: string;
  attachments: {
    name: string;
    size: number;
    type: string;
    externalId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    preview?: string;
    base64?: string;
  }[];
}
