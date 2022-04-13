import { HydratedDocument } from 'mongoose';
import { HttpException } from '@/exceptions/HttpException';
import { Project } from '@/interfaces/project.interface';
import jobModel from '@/models/jobs.model';
import projectsService from './projects.service';
import { Job } from '@/interfaces/job.interface';
import { RequestWithUser } from '@/interfaces/auth.interface';

class JobsService {
  public jobs = jobModel;
  private projectsService = new projectsService();

  public async getJobByJobNumberWithFullPath(req: RequestWithUser): Promise<HydratedDocument<Job>> {
    const jobNumber = parseInt(req.params.jobnumber as string);
    const findProject: HydratedDocument<Project> = await this.projectsService.getProjectByCreatorAndName(req);

    const findJob = await this.jobs.findOne({ project: findProject._id, jobNumber });
    if (!findJob) throw new HttpException(404, `Job #${jobNumber} doesn't exist`);

    return findJob;
  }

  public async updateJobByJobNumberWithFullPath(req: RequestWithUser, update): Promise<HydratedDocument<Job>> {
    const jobNumber = parseInt(req.params.jobnumber as string);
    const findProject = await this.projectsService.getProjectByCreatorAndName(req);

    const updateJob = await this.jobs.findOneAndUpdate({ project: findProject._id, jobNumber }, update, { returnOriginal: false });
    if (!updateJob) throw new HttpException(404, `Job #${jobNumber} doesn't exist`);

    return updateJob;
  }

  public async getJobsByProjectWithFullPath(
    req: RequestWithUser,
    options: {
      populate?: boolean;
      skip?: number;
      limit?: number;
    },
  ) {
    const findProject = await this.projectsService.getProjectByCreatorAndName(req);

    let query = this.jobs.find({ project: findProject._id });
    if (options.populate) query = query.populate('project');
    const findJobs = await query;

    return findJobs;
  }
}

export default JobsService;
