import { model, Schema, Document } from 'mongoose';
import { Project } from '@/interfaces/project.interface';

const projectSchema: Schema = new Schema({
  creator: { type: String, required: true },
  githubRepo: String,
  name: { type: String, required: true, min: 3, max: 100, trim: true },
  displayName: { type: String, min: 3, max: 100, trim: true },
  imageUrl: { type: String, trim: true },
  tags: [String],
  description: { type: String, trim: true },
  private: Boolean,
  // counters
  jobsCount: { type: Number, default: 0 },
}).index({ creator: 1, name: 1 }, { unique: true });

const projectModel = model<Project & Document>('Project', projectSchema);

export default projectModel;
