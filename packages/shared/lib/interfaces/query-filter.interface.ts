export interface IQueryFilter {
  limit: number;
  take: number;
  order: OrderBy;
  orderProperty: string;
  q: string;
}

export enum OrderBy {
  DESC = 'desc',
  ASC = 'asc',
}
