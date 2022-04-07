import { model, Schema, Document } from 'mongoose';
import { Job } from '@interfaces/job.interface';

const jobSchema: Schema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    jobNumber: Number,
    title: { type: String, required: true },
    body: String,
    imageUrl: String,
    comments: [{ type: Schema.Types.ObjectId, ref: 'JobComment', index: true }],
    subscribers: [String],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
).index({ project: 1, jobNumber: 1 }, { unique: true });

jobSchema.virtual('private').get(function () {
  return this.project.private;
});

const jobModel = model<Job & Document>('Job', jobSchema);

export default jobModel;
