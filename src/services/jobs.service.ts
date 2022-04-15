import { HydratedDocument, PipelineStage } from 'mongoose';
import { HttpException } from '@/exceptions/HttpException';
import { Project } from '@/interfaces/project.interface';
import jobModel from '@/models/jobs.model';
import projectsService from './projects.service';
import { Job } from '@/interfaces/job.interface';
import { RequestWithUser } from '@/interfaces/auth.interface';
import jobCommentModel from '@/models/job-comments.model';
import jobSubmissionModel from '@/models/job-submissions.model';
import jobSubscriptionModel from '@/models/job-subscriptions.model';

const populateProject: PipelineStage = {
  $lookup: {
    from: 'projects',
    localField: 'project',
    foreignField: '_id',
    as: 'projects',
  },
};

const countSubscriptions: PipelineStage = {
  $lookup: {
    from: 'jobsubscriptions',
    localField: '_id',
    foreignField: 'job',
    as: 'subscriptionsData',
  },
};

const countComments: PipelineStage = {
  $lookup: {
    from: 'jobcomments',
    localField: '_id',
    foreignField: 'job',
    as: 'commentsData',
  },
};

class JobsService {
  public jobs = jobModel;
  public comments = jobCommentModel;
  public submissions = jobSubmissionModel;
  public subscriptions = jobSubscriptionModel;
  private projectsService = new projectsService();

  public async getJobByJobNumberWithFullPath(
    req: RequestWithUser,
    options?: {
      populate?: boolean;
    },
  ): Promise<HydratedDocument<Job>> {
    const jobNumber = parseInt(req.params.jobnumber as string);
    const findProject: HydratedDocument<Project> = await this.projectsService.getProjectByCreatorAndName(req);

    let query = this.jobs.findOne({ project: findProject._id, jobNumber });
    if (options?.populate) query = query.populate('project');
    const findJob = await query;

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
    options?: {
      populate?: boolean;
      skip?: number;
      limit?: number;
      countComments?: boolean;
      countSubscriptions?: boolean;
    },
  ) {
    const findProject = await this.projectsService.getProjectByCreatorAndName(req);

    const aggregatePipeline: PipelineStage[] = [
      { $match: { project: findProject._id } },
      { $skip: options?.limit || 0 },
      { $limit: options?.limit || 20 },
    ];

    if (options?.populate !== false)
      aggregatePipeline.push(populateProject, {
        $addFields: { project: { $arrayElemAt: ['$projects', 0] } },
      });

    if (options?.countComments !== false) {
      console.log('comments');
      aggregatePipeline.push(countComments, {
        $addFields: {
          commentsCount: { $size: '$commentsData' },
        },
      });
    }
    if (options?.countSubscriptions !== false)
      aggregatePipeline.push(countSubscriptions, {
        $addFields: {
          subscriptionsCount: { $size: '$subscriptionsData' },
        },
      });

    const jobsWithCounts: Job[] = await this.jobs.aggregate([
      ...aggregatePipeline,
      {
        $project: {
          projects: 0,
          commentsData: 0,
          submissionsData: 0,
          subscriptionsData: 0,
        },
      },
    ]);

    return jobsWithCounts;
  }
}

export default JobsService;
