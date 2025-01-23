import type { Plan } from '../constants';
import type { ISubscription } from './subscription.interface';

export interface ICustomer {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string | null;
  phone?: string;
  name?: string;
  addresses: any[];
  logo?: string;
  subscriptionId: string;
  subscription: ISubscription;
  defaultPaymentMethodId?: string;
  ownerId: string;
  plan: Plan;
}
