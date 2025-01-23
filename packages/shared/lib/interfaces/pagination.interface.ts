import type { OrderBy } from './query-filter.interface';

export interface IPagination {
  limit: number;
  take: number;
  order?: OrderBy;
  orderProperty?: string;
  q?: string;
  excludeIds?: boolean;
  start?: string;
  end?: string;
  favorite?: boolean;
  projectId?: string;
  spaceId?: string;
  status?: string;
  priority?: string;
  excludeStatus?: string;
}
