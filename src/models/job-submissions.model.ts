import { model, Schema, Document } from 'mongoose';
import { Job, JobSubmission } from '@interfaces/job.interface';
import jobModel from './jobs.model';

const jobSubmissionSchema: Schema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: String, required: true },
    githubRepo: { type: String, required: true, trim: true },
    description: String,
    // counters
    submissionNumber: { type: Number, default: 1 },
  },
  { timestamps: true },
).index({ job: 1, submissionNumber: 1 }, { unique: true });

jobSubmissionSchema.pre('save', async function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  // TODO: format code and don't auto increment after error
  // auto increment submission count
  try {
    const updatedJob: Job = await jobModel.findByIdAndUpdate(this.job, { $inc: { submissionsCount: 1 } }, { new: true });
    const submissionNumber = updatedJob.submissionsCount;
    this.submissionNumber = submissionNumber;
    next();
  } catch (err) {
    next(err);
  }
});

const jobSubmissionModel = model<JobSubmission & Document>('JobSubmission', jobSubmissionSchema);

export default jobSubmissionModel;
