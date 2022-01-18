import { User } from './users.interface';

export interface Project {
  _id: string;
  creatorId: string; // User._id
  name: string;
  githubProject?: string;
}
