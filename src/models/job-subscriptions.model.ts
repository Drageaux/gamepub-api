import { model, Schema, Document } from 'mongoose';
import { JobSubscription } from '@interfaces/job.interface';

const jobSubscriptionSchema: Schema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: String, required: true },
    accepted: { type: Boolean, default: false },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true },
).index({ job: 1, user: 1 }, { unique: true });

const jobSubscriptionModel = model<JobSubscription & Document>('JobSubscription', jobSubscriptionSchema);

export default jobSubscriptionModel;
