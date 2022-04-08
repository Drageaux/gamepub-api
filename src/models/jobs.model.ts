import { model, Schema, Document } from 'mongoose';
import { Job } from '@interfaces/job.interface';

const jobSchema: Schema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    jobNumber: Number,
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    subscribers: [String],
    // commentsCount: { type: Number, default: 0 },
    // submissionsCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
).index({ project: 1, jobNumber: 1 }, { unique: true });

jobSchema.virtual('private').get(function () {
  return this.project.private;
});

const jobModel = model<Job & Document>('Job', jobSchema);

export default jobModel;
