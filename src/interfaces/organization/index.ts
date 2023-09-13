import { BotInterface } from 'interfaces/bot';
import { UserInterface } from 'interfaces/user';
import { GetQueryInterface } from 'interfaces';

export interface OrganizationInterface {
  id?: string;
  description?: string;
  status?: string;
  industry?: string;
  name: string;
  created_at?: any;
  updated_at?: any;
  user_id: string;
  tenant_id: string;
  bot?: BotInterface[];
  user?: UserInterface;
  _count?: {
    bot?: number;
  };
}

export interface OrganizationGetQueryInterface extends GetQueryInterface {
  id?: string;
  description?: string;
  status?: string;
  industry?: string;
  name?: string;
  user_id?: string;
  tenant_id?: string;
}
