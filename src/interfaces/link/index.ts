import { UserInterface } from 'interfaces/user';
import { GetQueryInterface } from 'interfaces';

export interface LinkInterface {
  id?: string;
  url: string;
  description?: string;
  user_id: string;
  status: string;
  type: string;
  created_at?: any;
  updated_at?: any;

  user?: UserInterface;
  _count?: {};
}

export interface LinkGetQueryInterface extends GetQueryInterface {
  id?: string;
  url?: string;
  description?: string;
  user_id?: string;
  status?: string;
  type?: string;
}
