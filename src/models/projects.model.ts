import { model, Schema, Document } from 'mongoose';
import { Project } from '@/interfaces/project.interface';

const projectSchema: Schema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  displayName: { type: String, required: true },
  githubRepo: String,
  name: String,
});

const projectModel = model<Project & Document>('Project', projectSchema);

export default projectModel;
