import { useMemo } from 'react';
import { isToday, parseISO } from 'date-fns';

import { useGetSlicesQuery } from '@extension/store';

export const useSlicesCreatedToday = (): number => {
  const { isLoading, isError, data: slices } = useGetSlicesQuery({ limit: 1, take: 11 });

  return useMemo(() => {
    if (!slices?.items?.length) return 0;

    return slices.items.filter(item => isToday(parseISO(item.createdAt))).length;
  }, [slices?.items]);
};
