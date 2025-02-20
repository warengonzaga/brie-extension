import type { SubscriptionStatus } from '../constants';
import type { Organization } from './organization.interface';

export interface Subscription {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  stripeSubscriptionId: string;
  organization: Organization;
  organizationId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd: Date;
}
