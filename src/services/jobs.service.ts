import { HydratedDocument, PipelineStage } from 'mongoose';
import { HttpException } from '@/exceptions/HttpException';
import { Project } from '@/interfaces/project.interface';
import jobModel from '@/models/jobs.model';
import projectsService from './projects.service';
import { Job, JobSubmission, JobWithSubscriptionStatus } from '@/interfaces/job.interface';
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

const includeSubscriptionFrom = (username: string): PipelineStage => {
  return {
    $lookup: {
      from: 'jobsubscriptions',
      localField: '_id',
      foreignField: 'job',
      // let: { user: '$user' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$user', username] },
          },
        },
      ],
      as: 'userSubscription',
    },
  };
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

interface JobQueryOptions {
  match?: any;
  populate?: boolean; // default: true
  skip?: number; // default: 0
  limit?: number; // default: 20
  includeSubscription?: boolean; // default: false
  countComments?: boolean; // default: true
  countSubscriptions?: boolean; // default: true
}

interface JobsQueryOptions extends JobQueryOptions {
  skip?: number;
  limit?: number;
}

class JobsService {
  public jobs = jobModel;
  public comments = jobCommentModel;
  public submissions = jobSubmissionModel;
  public subscriptions = jobSubscriptionModel;
  private projectsService = new projectsService();

  public async getPublicJobs(req: RequestWithUser, options?: JobsQueryOptions) {
    const aggregatePipeline: PipelineStage[] = [
      { $match: { private: { $ne: true } } },
      { $skip: options?.limit || 0 },
      { $limit: options?.limit || 20 },
      ...this.buildPipeLine(options, req.username),
    ];
    const jobsWithCounts: (Job | JobWithSubscriptionStatus)[] = await this.jobs.aggregate([...aggregatePipeline]);

    return jobsWithCounts;
  }

  public async getJobByJobNumberWithFullPath(req: RequestWithUser, options?: JobQueryOptions): Promise<HydratedDocument<Job>> {
    const jobNumber = parseInt(req.params.jobnumber as string);
    const findProject: HydratedDocument<Project> = await this.projectsService.getProjectByCreatorAndName(req);

    const findJobResults = await this.jobs.aggregate([{ $match: { project: findProject._id, jobNumber } }, ...this.buildPipeLine(options)]);
    const findJob = findJobResults[0];

    if (!findJob) throw new HttpException(404, `Job #${jobNumber} doesn't exist`);

    return findJob;
  }

  public async getJobsByProjectWithFullPath(req: RequestWithUser, options?: JobsQueryOptions) {
    const findProject = await this.projectsService.getProjectByCreatorAndName(req);

    const aggregatePipeline: PipelineStage[] = [
      { $match: { project: findProject._id } },
      { $skip: options?.limit || 0 },
      { $limit: options?.limit || 20 },
    ];
    const jobsWithCounts: (Job | JobWithSubscriptionStatus)[] = await this.jobs.aggregate([
      ...aggregatePipeline,
      ...this.buildPipeLine(options, req.username),
    ]);

    return jobsWithCounts;
  }

  public async updateJobByJobNumberWithFullPath(req: RequestWithUser, update): Promise<HydratedDocument<Job>> {
    const jobNumber = parseInt(req.params.jobnumber as string);
    const findProject = await this.projectsService.getProjectByCreatorAndName(req);

    const updateJob = await this.jobs.findOneAndUpdate({ project: findProject._id, jobNumber }, update, { returnOriginal: false });
    if (!updateJob) throw new HttpException(404, `Job #${jobNumber} doesn't exist`);

    return updateJob;
  }

  public async updateJobSubmissionWithFullPath(req: RequestWithUser, update): Promise<HydratedDocument<JobSubmission>> {
    const jobNumber = parseInt(req.params.jobnumber as string);
    const submissionNumber = parseInt(req.params.submissionnumber as string);
    const findProject = await this.projectsService.getProjectByCreatorAndName(req);
    const findJob = await this.jobs.findOne({ project: findProject._id, jobNumber });

    const updateSubmission = await this.submissions.findOneAndUpdate({ _id: findJob._id, submissionNumber }, update, { returnOriginal: false });
    if (!updateSubmission) throw new HttpException(404, `Job #${jobNumber} doesn't exist`);

    return updateSubmission;
  }

  /**
   * Build $aggregate pipeline based on query options.
   *
   * @param options
   * @param username required if includeSubscription is enabled
   * @returns
   */
  private buildPipeLine(options?: JobQueryOptions, username?: string) {
    const pipeline = [];

    if (options?.populate !== false)
      pipeline.push(populateProject, {
        $addFields: { project: { $arrayElemAt: ['$projects', 0] } },
      });

    if (options?.includeSubscription && username) {
      pipeline.push(
        includeSubscriptionFrom(username),
        { $addFields: { subscription: { $mergeObjects: ['$userSubscription'] } } },
        { $project: { userSubscription: 0 } },
      );
    }

    if (options?.countComments !== false) {
      pipeline.push(countComments, {
        $addFields: {
          commentsCount: { $size: '$commentsData' },
        },
      });
    }
    if (options?.countSubscriptions !== false)
      pipeline.push(
        countSubscriptions,
        {
          $addFields: {
            collaboratorsData: {
              $filter: {
                input: '$subscriptionsData',
                as: 'sub_field',
                cond: {
                  $eq: ['$$sub_field.accepted', true],
                },
              },
            },
          },
        },
        {
          $addFields: {
            subscriptionsCount: { $size: '$subscriptionsData' },
            collaboratorsCount: { $size: '$collaboratorsData' },
          },
        },
      );

    pipeline.push({
      $project: {
        projects: 0,
        commentsData: 0,
        submissionsData: 0,
        subscriptionsData: 0,
        collaboratorsData: 0,
      },
    });

    return pipeline;
  }
}

export default JobsService;
