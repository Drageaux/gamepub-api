import { Types } from 'mongoose';

export interface Project {
  _id: Types.ObjectId;
  creator: string;
  name: string;
  displayName?: string;
  githubRepo?: string;
  imageUrl?: string;
  private?: boolean;
  // counters
  jobsCount?: number;
}
