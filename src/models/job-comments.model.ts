import { model, Schema, Document } from 'mongoose';
import { Job } from '@interfaces/job.interface';

const jobCommentSchema: Schema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    body: { type: String, required: true },
  },
  { timestamps: true },
);

const jobCommentModel = model<Job & Document>('JobComment', jobCommentSchema);

export default jobCommentModel;
