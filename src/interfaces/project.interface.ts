import { Types } from 'mongoose';
import { User } from './users.interface';
import { Job } from './job.interface';

export interface Project {
  _id: Types.ObjectId;
  creator: string;
  name: string;
  displayName?: string;
  githubRepo?: string;
  imageUrl?: string;
  jobs?: Types.DocumentArray<Job>;
  private?: boolean;
}
