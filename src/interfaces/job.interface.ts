import { Types } from 'mongoose';
import { Project } from './project.interface';

export interface Job {
  _id: Types.ObjectId;
  project: Types.ObjectId | Project; // Project._id
  jobNumber?: number;
  title: string;
  body?: string;
  imageUrl?: string;
  private?: boolean;
  closed?: boolean;
  // counters
  submissionsCount?: number;
}

export interface JobSubscription {
  _id: Types.ObjectId;
  user: string;
  job: Types.ObjectId | Job;
  accepted?: boolean;
  notified?: boolean;
}

export interface JobComment {
  _id: Types.ObjectId;
  user: string;
  job: Types.ObjectId | Job;
  body: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface JobSubmission {
  _id: Types.ObjectId;
  job: Types.ObjectId | Job;
  submissionNumber: number;
  githubRepo: string;
  body?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
