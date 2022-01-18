import { model, Schema, Document } from 'mongoose';
import { Project } from '@/interfaces/project.interface';

const projectSchema: Schema = new Schema({
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
});

const projectModel = model<Project & Document>('Project', projectSchema);

export default projectModel;
