import { Types } from 'mongoose';
import { Project } from './project.interface';

export interface Job {
  _id: Types.ObjectId;
  project: Types.ObjectId | Project; // Project._id
  jobNumber?: number;
  title: string;
  body?: string;
  imageUrl?: string;
  // comments?: JobComment[];
}

export interface JobComment {
  _id: Types.ObjectId;
  project: Types.ObjectId | Project;
  job: Types.ObjectId | Job;
  body: string;
}
