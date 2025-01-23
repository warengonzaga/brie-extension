import type { IIssue, IProject } from '.';

export interface ISpace {
  id: string;
  externalId: string | null;
  internalId: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  name: string;
  metadata: string | null;
  description: string | null;
  projectId: string;
  project: IProject;
  issues: IIssue;
}
