import { model, Schema, Document } from 'mongoose';
import { Job, JobSubmission } from '@interfaces/job.interface';
import jobModel from './jobs.model';

const jobSubmissionSchema: Schema = new Schema(
  {
    submissionNumber: { type: Number, default: 1 },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: String, required: true },
    githubRepo: { type: String, required: true, trim: true },
    description: String,
  },
  { timestamps: true },
).index({ job: 1, jobNumber: 1 }, { unique: true });

jobSubmissionSchema.pre('save', async function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  // auto increment job count
  try {
    const updatedJob: Job = await jobModel.findByIdAndUpdate(this.job, { $inc: { submissionsCount: 1 } }, { new: true });
    const submissionNumber = updatedJob.submissionsCount;
    this.jobNumber = submissionNumber;
    next();
  } catch (err) {
    next(err);
  }
});

const jobSubmissionModel = model<JobSubmission & Document>('JobSubmission', jobSubmissionSchema);

export default jobSubmissionModel;
