import { model, Schema, Document } from 'mongoose';
import { JobComment } from '@interfaces/job.interface';

const jobCommentSchema: Schema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true },
);

const jobCommentModel = model<JobComment & Document>('JobComment', jobCommentSchema);

export default jobCommentModel;
