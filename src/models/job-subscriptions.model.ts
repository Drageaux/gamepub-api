import { model, Schema, Document } from 'mongoose';
import { JobSubmission } from '@interfaces/job.interface';

const jobSubscriptionSchema: Schema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: String, required: true },
    accepted: { type: Boolean, default: false },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true },
).index({ job: 1, submissionNumber: 1 }, { unique: true });

const jobSubscriptionModel = model<JobSubmission & Document>('JobSubmission', jobSubscriptionSchema);

export default jobSubscriptionModel;
