import { Types } from 'mongoose';
import { Project } from './project.interface';

export interface Job {
  _id: Types.ObjectId;
  project: Types.ObjectId | Project; // Project._id
  title: string;
  body?: string;
  imageUrl?: string;
}
