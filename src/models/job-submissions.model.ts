import { model, Schema, Document } from 'mongoose';
import { JobSubmission } from '@interfaces/job.interface';

const jobSubmissionSchema: Schema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: String, required: true },
    githubRepo: { type: String, required: true, trim: true },
    description: String,
  },
  { timestamps: true },
);

const jobSubmissionModel = model<JobSubmission & Document>('JobSubmission', jobSubmissionSchema);

export default jobSubmissionModel;
