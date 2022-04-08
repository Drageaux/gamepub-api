import projectModel from '@models/projects.model';
import { model, Schema, Document } from 'mongoose';
import { Job } from '@interfaces/job.interface';

const jobSchema: Schema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    jobNumber: { type: Number, default: 1 },
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'JobComment' }],
    subscribers: [String],
    // counters
    submissionsCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
).index({ project: 1, jobNumber: 1 }, { unique: true });

jobSchema.pre('save', async function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  // TODO: format code and don't auto increment after error
  // auto increment job count
  try {
    const updatedProject = await projectModel.findByIdAndUpdate(this.project, { $inc: { jobsCount: 1 } }, { new: true });
    const jobNumber = updatedProject.jobsCount;
    this.jobNumber = jobNumber;
    next();
  } catch (err) {
    next(err);
  }
});

jobSchema.virtual('private').get(function () {
  return this.project.private;
});

const jobModel = model<Job & Document>('Job', jobSchema);

export default jobModel;
