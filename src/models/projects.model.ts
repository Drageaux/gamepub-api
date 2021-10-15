import { model, Schema, Document } from 'mongoose';
import { Project } from '@/interfaces/project.interface';

const projectSchema: Schema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  ghOwner: { type: String },
  ghRepo: { type: String },
});

const projectModel = model<Project & Document>('Project', projectSchema);

export default projectModel;
