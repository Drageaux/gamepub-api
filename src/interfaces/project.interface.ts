import { Types } from 'mongoose';
import { User } from './users.interface';

export interface Project {
  _id: Types.ObjectId;
  creator: Types.ObjectId | User; // User._id
  displayName: string;
  githubRepo?: string;
  name?: string;
}
