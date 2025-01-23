import type { SubscriptionStatus } from '../constants';
import type { ICustomer } from './customer.interface';

export interface ISubscription {
  customer: ICustomer;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  stripeSubscriptionId: string;
  customerId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd: Date;
}
