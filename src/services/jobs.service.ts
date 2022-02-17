import { Job } from '@/interfaces/job.interface';
import jobModel from '@/models/jobs.model';
import { Document } from 'mongoose';

class JobsService {
  public jobs = jobModel;

  public async getJobsWithNumbers(projectId: string): Promise<Job[]> {
    const findJobsByProject: (Job & Document)[] = await this.jobs.find({ project: projectId }).sort({ createdAt: 'asc' });

    return findJobsByProject.map((x, index) => {
      return { ...x.toObject(), jobNumber: index + 1 };
    });
  }
}

export default JobsService;
