import { model, Schema, Document } from 'mongoose';
import { JobSubmission } from '@interfaces/job.interface';

const jobSubmissionSchema: Schema = new Schema(
  {
    submissionNumber: { type: Number, required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: String, required: true },
    githubRepo: { type: String, required: true, trim: true },
    body: String,
  },
  { timestamps: true },
).index({ job: 1, submissionNumber: 1 }, { unique: true });

const jobSubmissionModel = model<JobSubmission & Document>('JobSubmission', jobSubmissionSchema);

export default jobSubmissionModel;
