import { HydratedDocument } from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import jobModel from '@models/jobs.model';
import projectModel from '@models/projects.model';
import jobCommentModel from '@/models/job-comments.model';
import jobSubmissionModel from '@/models/job-submissions.model';
import jobSubscriptionModel from '@/models/job-subscriptions.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@exceptions/HttpException';
import { Job, JobComment, JobWithSubscriptionStatus } from '@interfaces/job.interface';
import { Project } from '@/interfaces/project.interface';
import projectsService from '@services/projects.service';
import jobsService from '@/services/jobs.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

class JobsController {
  jobs = jobModel;
  jobComments = jobCommentModel;
  jobSubmissions = jobSubmissionModel;
  jobSubscriptions = jobSubscriptionModel;
  projects = projectModel;
  public projectsService = new projectsService();
  public jobsService = new jobsService();

  public getJobs = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      // TODO: limit to 20 jobs by default, then limit to 100 max

      const username = req.username;

      const findJobsWithSubscriptionStatus: JobWithSubscriptionStatus[] = await this.jobs.aggregate([
        {
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
        },
        {
          $addFields: {
            subscription: { $mergeObjects: ['$userSubscription'] },
          },
        },
        { $project: { userSubscription: 0 } },
      ]);

      await this.jobs.populate(findJobsWithSubscriptionStatus, { path: 'project' });

      // const findJobs = await this.jobs.find({ private: { $ne: true } }).populate('project');

      res.status(200).json({ data: findJobsWithSubscriptionStatus, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Receive {username} and {projectname} params and find jobs by project.
   *
   * @param req
   * @param res
   * @param next
   */
  public getJobsByProjectFullPath = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      // TODO: skip and limit in query
      const jobs = await this.jobsService.getJobsByProjectWithFullPath(req, { populate: true });

      res.status(200).json({ data: jobs, message: 'findByProject' });
    } catch (error) {
      next(error);
    }
  };

  // /**
  //  * Receive {projectid} param and find jobs by project.
  //  * Should send response with jobs.sorted.
  //  *
  //  * @param req
  //  * @param res
  //  * @param next
  //  */
  // public getJobsByProjectId = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const projectId = (req.params.projectid as string).toLocaleLowerCase();
  //     const findJobsByProject: Job[] = await this.jobs.find({ project: projectId });

  //     res.status(201).json({ data: findJobsByProject, message: 'findByProjectId' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  /**
   * Receive {username} and {projectname} params and a job body and create a new job
   * with job number (sorted by date created).
   *
   * @param req
   * @param res
   * @param next
   */
  public createJob = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (isEmpty(req.body)) return next(new HttpException(400, 'Requires a JSON body.'));

    // retry 3 times, maybe unnecessary, but could be unlucky
    let tries = 0;
    const maxTries = 3;
    while (true) {
      try {
        // "auto"-increment jobs count to account for concurrent requests
        const updatedProject = await this.projectsService.updateProjectByCreatorAndName(req, {
          $inc: { jobsCount: 1 },
        });
        // get the earliest job count, reducing likelihood of duplicate key
        const jobNumber = updatedProject.jobsCount;
        const newJobData = await this.jobs
          .create({
            project: updatedProject._id,
            ...req.body,
            jobNumber,
          })
          .catch(async () => {
            // revert incremented count if error
            await updatedProject.updateOne({ $inc: { jobsCount: -1 } });
            throw new HttpException(409, 'There was a duplicate key error. Please try again in a bit.');
          });

        return res.status(201).json({ data: newJobData, message: 'created' });
      } catch (error) {
        tries++;
        if (tries === maxTries) {
          return next(error);
        }
      }
    }
  };

  public updateJobByJobNumber = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const update = req.body;
      const findJob = await this.jobsService.updateJobByJobNumberWithFullPath(req, { ...update });

      res.status(200).json({ data: findJob, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Receive {username}, {projectname}, and {jobnumber} params to fetch a single job.
   *
   * @param req
   * @param res
   * @param next
   */
  public getJobByJobNumber = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findJob = await this.jobsService.getJobByJobNumberWithFullPath(req);

      res.status(200).json({ data: findJob, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public getJobComments = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findJob = await this.jobsService.getJobByJobNumberWithFullPath(req);
      const findCommentsByJob: JobComment[] = await this.jobComments.find({
        job: findJob._id,
      });

      res.status(200).json({ data: findCommentsByJob, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public postJobComment = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (isEmpty(req.body)) throw new HttpException(400, 'Requires a JSON body.');
      if (!req.username) throw new HttpException(401, 'Unauthorized.');

      const body = req.body.body;
      const findJob = await this.jobsService.getJobByJobNumberWithFullPath(req);
      const createCommentData = await this.jobComments.create({
        user: req.username,
        project: findJob.project,
        job: findJob._id,
        body,
      });

      res.status(201).json({ data: createCommentData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public setSubscriptionForJobByJobNumber = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.username) throw new HttpException(401, 'Unauthorized.');
      const body = req.body;

      const job: Job = await this.jobsService.getJobByJobNumberWithFullPath(req, { populate: true });
      const setSubscriberData = await this.jobSubscriptions.findOneAndUpdate({ user: req.username, job: job._id }, body, {
        upsert: true,
        returnOriginal: false,
      });

      const jobWithSubscriptionStatus: JobWithSubscriptionStatus = {
        ...job,
        subscription: {
          accepted: setSubscriberData.accepted,
          notified: setSubscriberData.notified,
        },
      };

      res.status(200).json({ data: jobWithSubscriptionStatus, message: 'updatedSubscription' });
    } catch (error) {
      next(error);
    }
  };

  public unsubscribeFromAJob = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.username) throw new HttpException(401, 'Unauthorized.');

      const job = await this.jobsService.getJobByJobNumberWithFullPath(req);
      await this.jobSubscriptions.findOneAndRemove({ user: req.username, job: job._id });

      res.status(204).json({ message: 'unsubscribed' });
    } catch (error) {
      next(error);
    }
  };

  //
  public getSubmissionsByJobFullPath = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const job = await this.jobsService.getJobByJobNumberWithFullPath(req);
      const allSubmissionsData = await this.jobSubmissions.find({ job: job._id });

      res.status(200).json({ data: allSubmissionsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getSubmissionByFullPath = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const submissionNumber = parseInt(req.params.submissionnumber as string);
      const job = await this.jobsService.getJobByJobNumberWithFullPath(req);
      const findSubmission = await this.jobSubmissions.findOne({ job: job._id, submissionNumber });

      if (!findSubmission) throw new HttpException(404, 'Job submission not found.');

      res.status(200).json({ data: findSubmission, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public postSubmissionByJobNumberFullPath = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (isEmpty(req.body)) return next(new HttpException(400, 'Requires a JSON body.'));
    if (!req.username) return next(new HttpException(401, 'Unauthorized.'));

    // retry 3 times, maybe unnecessary, but could be unlucky
    let tries = 0;
    const maxTries = 3;
    while (true) {
      try {
        // "auto"-increment jobs count to account for concurrent requests
        const updatedJob = await this.jobsService.updateJobByJobNumberWithFullPath(req, {
          $inc: { submissionsCount: 1 },
        });
        // get the earliest job count, reducing likelihood of duplicate key
        const submissionNumber = updatedJob.submissionsCount;
        const newSubmissionData = await this.jobSubmissions
          .create({
            user: req.username,
            job: updatedJob._id,
            ...req.body,
            submissionNumber,
          })
          .catch(async () => {
            // revert incremented count if error
            await updatedJob.updateOne({ $inc: { jobsCount: -1 } });
            throw new HttpException(409, 'There was a duplicate key error. Please try again in a bit.');
          });

        return res.status(201).json({ data: newSubmissionData, message: 'created' });
      } catch (error) {
        tries++;
        if (tries === maxTries) {
          return next(error);
        }
      }
    }
  };
}

export default JobsController;
