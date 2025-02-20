import { useEffect, useMemo } from 'react';
import { differenceInCalendarDays, isWithinInterval, addDays, parseISO } from 'date-fns';

import type { Subscription } from '@extension/shared';

import { useUserOrganization } from './use-user-organization.hook';
import { useLazyGetSubscriptionByIdQuery } from '../store';

export const useSubscription = (): {
  fields:
    | Subscription
    | {
        isPaymentMethodRequired: boolean;
        isTrialExpired: boolean;
        trialExpireInDays: number;
      }
    | any;
  isLoading: boolean;
  isError: boolean;
} => {
  const org = useUserOrganization();

  const [getSubscriptionById, { isLoading, isError, data: fields }] = useLazyGetSubscriptionByIdQuery();

  useEffect(() => {
    if (org?.fields?.subscriptionId) {
      getSubscriptionById({
        id: org?.fields?.subscriptionId,
      });
    }
  }, [org?.fields?.subscriptionId]);

  return useMemo(
    () => ({
      isLoading,
      isError,
      fields: {
        ...fields,
        trialExpireInDays: differenceInCalendarDays(parseISO(fields?.trialEnd), new Date()),
        isTrialExpired: isWithinInterval(new Date(), {
          start: parseISO(fields?.trialEnd),
          end: addDays(parseISO(fields?.trialEnd), 7),
        }),
        isPaymentMethodRequired: !org?.fields?.defaultPaymentMethodId,
      },
    }),
    [isLoading, isError, fields, org?.fields?.defaultPaymentMethodId],
  );
};
