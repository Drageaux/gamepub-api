import { Types } from 'mongoose';

export interface Project {
  _id: Types.ObjectId;
  creator: string;
  name: string;
  displayName?: string;
  githubRepo?: string;
  imageUrl?: string;
  jobsCount?: number;
  private?: boolean;
}
