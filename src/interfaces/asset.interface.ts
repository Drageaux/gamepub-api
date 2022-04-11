import { Types } from 'mongoose';

export interface Asset {
  _id?: Types.ObjectId;
  puid: string;
  creator: string;
  displayName: string;
  githubRepo: string;
  body?: string;
  private?: boolean;
}
