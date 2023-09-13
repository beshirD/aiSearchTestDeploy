import { UserInterface } from 'interfaces/user';
import { GetQueryInterface } from 'interfaces';

export interface SearchInterface {
  id?: string;
  query: string;
  user_id: string;
  status: string;
  type: string;
  results_count: number;
  created_at?: any;
  updated_at?: any;

  user?: UserInterface;
  _count?: {};
}

export interface SearchGetQueryInterface extends GetQueryInterface {
  id?: string;
  query?: string;
  user_id?: string;
  status?: string;
  type?: string;
}
