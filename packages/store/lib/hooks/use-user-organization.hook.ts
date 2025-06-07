import { useGetOrganizationByIdQuery } from '../store/index.js';
import { useMemo } from 'react';
import type { Organization } from '@extension/shared';

export const useUserOrganization = (): {
  fields: Organization | undefined;
  isLoading: boolean;
  isError: boolean;
} => {
  const { isLoading, isError, data } = useGetOrganizationByIdQuery();

  return useMemo(() => ({ isLoading, isError, fields: data }), [data, isError, isLoading]);
};
