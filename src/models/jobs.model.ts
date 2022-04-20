import { model, Schema, Document } from 'mongoose';
import { Job } from '@interfaces/job.interface';

const jobSchema: Schema = new Schema(
  {
    jobNumber: { type: Number, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'JobComment' }],
    private: { type: Boolean, default: false },
    closed: { type: Boolean, default: false },
    // counters
    submissionsCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
).index({ project: 1, jobNumber: 1 }, { unique: true });

const jobModel = model<Job & Document>('Job', jobSchema);

export default jobModel;
