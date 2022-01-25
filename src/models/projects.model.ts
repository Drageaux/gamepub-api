import { model, Schema, Document } from 'mongoose';
import { Project } from '@/interfaces/project.interface';

const projectSchema: Schema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  githubRepo: String,
  displayName: String,
  imageUrl: String,
}).index({ creator: 1, name: 1 }, { unique: true });

const projectModel = model<Project & Document>('Project', projectSchema);
projectModel.createIndexes();

export default projectModel;
