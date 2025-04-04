import type { Plan } from '../constants/index.js';
import type { Subscription } from './subscription.interface.js';

export interface Organization {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string | null;
  phone?: string;
  name?: string;
  addresses: any[];
  logo?: string;
  subscriptionId: string;
  subscription: Subscription;
  defaultPaymentMethodId?: string;
  ownerId: string;
  plan: Plan;
}
