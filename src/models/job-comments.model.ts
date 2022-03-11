import { model, Schema, Document } from 'mongoose';
import { JobComment } from '@interfaces/job.interface';

const jobCommentSchema: Schema = new Schema(
  {
    // project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    // job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true },
);

jobCommentSchema.virtual('project', function () {
  return this.parent().project;
});

jobCommentSchema.virtual('job', function () {
  return this.parent()._id;
});

const jobCommentModel = model<JobComment & Document>('JobComment', jobCommentSchema);

export default jobCommentModel;
