import { model, Schema, Document } from 'mongoose';
import { Project } from '@/interfaces/project.interface';
import jobModel from './jobs.model';

const projectSchema: Schema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  githubRepo: String,
  name: { type: String, required: true, min: 3, max: 100 },
  displayName: { type: String, min: 3, max: 100 },
  imageUrl: String,
  tags: [String],
  description: String,
  jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
}).index({ creator: 1, name: 1 }, { unique: true });

const projectModel = model<Project & Document>('Project', projectSchema);

export default projectModel;
