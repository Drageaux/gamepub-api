import { User } from './users.interface';

export interface Project {
  _id: string;
  creator: string | User;
  name: string;
  ghOwner: string;
  ghRepo: string;
}
