import { model, Schema, Document } from 'mongoose';
import { Job } from '@/interfaces/job.interface';

const jobSchema: Schema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  body: String,
  imgUrl: String,
});

const jobModel = model<Job & Document>('Job', jobSchema);
jobModel.createIndexes();

export default jobModel;
