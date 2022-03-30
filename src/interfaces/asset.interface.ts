import { Types } from 'mongoose';

export interface Asset {
  _id: Types.ObjectId;
  creator: string;
  displayName: string;
  githubRepo: string;
  private?: boolean;
}
