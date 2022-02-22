import { Document, Types } from 'mongoose';
import { User } from './users.interface';
import { Mongoose } from 'mongoose';
import { Job } from './job.interface';

export interface Project extends Document {
  _id: Types.ObjectId;
  creator: Types.ObjectId | User; // User._id
  name: string;
  displayName?: string;
  githubRepo?: string;
  imageUrl?: string;
  jobs?: Types.DocumentArray<Job>;
}
