import { HydratedDocument } from 'mongoose';
import { HttpException } from '@/exceptions/HttpException';
import { Project } from '@/interfaces/project.interface';
import jobModel from '@/models/jobs.model';
import projectsService from './projects.service';

class JobsService {
  public jobs = jobModel;
  private projectsService = new projectsService();

  public async getJobByJobNumberWithFullPath(req) {
    const jobNumber = parseInt(req.params.jobnumber as string);
    const findProject: HydratedDocument<Project> = await this.projectsService.getProjectByCreatorAndName(req);

    const findJob = await this.jobs.findOne({ project: findProject._id, jobNumber });
    if (!findJob) throw new HttpException(404, `Job #${jobNumber} doesn't exist`);

    return findJob;
  }

  public async getJobsByProjectWithFullPath(
    req,
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
