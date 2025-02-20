import type { Pagination } from '../interfaces';
import { OrderBy } from '../interfaces';
import { ITEMS_PER_PAGE } from './pagination.constant';

export const INITIAL_PARAMS: Pagination = {
  limit: 1,
  take: ITEMS_PER_PAGE,
  orderProperty: 'createdAt',
  order: OrderBy.DESC,
  q: '',
  excludeIds: false,
};
