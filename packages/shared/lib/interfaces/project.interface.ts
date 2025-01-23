import type { ISpace } from './space.interface';
import type { IIssue } from './issue.interface';

export interface IProject {
  externalId: string;
  id: string;
  key: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  name: string;
  slug: string | null;
  avatarId: string | null;
  description: string | null;
  metadata: string | null;
  customerId: string;
  issues: IIssue[];
  isFavorite: boolean;
  spaces: ISpace[];
}
