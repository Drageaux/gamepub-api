import { Types } from 'mongoose';
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
