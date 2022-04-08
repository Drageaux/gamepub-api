import { Types } from 'mongoose';
import { Project } from './project.interface';

export interface Job {
  _id: Types.ObjectId;
  project: Types.ObjectId | Project; // Project._id
  jobNumber?: number;
  title: string;
  body?: string;
  imageUrl?: string;
  subscribers?: string[];
  private?: boolean;
  // counters
  submissionsCount?: number;
}

export interface JobComment {
  _id: Types.ObjectId;
  user: string;
  project: Types.ObjectId | Project;
  job: Types.ObjectId | Job;
  body: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface JobSubmission {
  _id: Types.ObjectId;
  job: Types.ObjectId | Job;
  githubRepo: string;
  description?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
