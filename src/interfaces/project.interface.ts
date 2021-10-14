import { User } from '@interfaces/users.interface';

export interface Project {
  _id: string;
  creator: User;
  name: string;
  ghOwner: string;
  ghRepo: string;
}
