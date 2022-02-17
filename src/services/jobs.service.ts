import { Job } from '@/interfaces/job.interface';
import jobModel from '@/models/jobs.model';

class JobsService {
  public jobs = jobModel;

  public async getJobsWithNumbers(projectId: string): Promise<Job[]> {
    const findJobsByProject: Job[] = await this.jobs.find({ project: projectId }).sort({ createdAt: 'asc' });

    return findJobsByProject.map((x: Job, index) => {
      x.jobNumber = index + 1;
      return x;
    });
  }
}

export default JobsService;
