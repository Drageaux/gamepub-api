import { Types } from 'mongoose';
import { User } from './users.interface';

export interface Project {
  _id: Types.ObjectId;
  creatorId: Types.ObjectId; // User._id
  name: string;
  githubProject?: string;
}
