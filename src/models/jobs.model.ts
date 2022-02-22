import { model, Schema, Document } from 'mongoose';
import { Job } from '@interfaces/job.interface';

const jobSchema: Schema = new Schema(
  {
    // project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    body: String,
    imageUrl: String,
    // comments: [{ type: Schema.Types.ObjectId, ref: 'JobComment', index: true }],
  },
  { timestamps: true },
);

jobSchema.virtual('project').get(function () {
  return this.parent()._id;
});

const jobModel = model<Job & Document>('Job', jobSchema);

export default jobModel;
