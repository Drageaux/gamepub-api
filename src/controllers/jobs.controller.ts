import { HydratedDocument } from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import jobModel from '@models/jobs.model';
import projectModel from '@models/projects.model';
import jobCommentModel from '@/models/job-comments.model';
import jobSubmissionModel from '@/models/job-submissions.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@exceptions/HttpException';
import { Job, JobComment } from '@interfaces/job.interface';
import projectsService from '@services/projects.service';
import jobsService from '@/services/jobs.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Project } from '@/interfaces/project.interface';

class JobsController {
  jobs = jobModel;
  jobComments = jobCommentModel;
  jobSubmissions = jobSubmissionModel;
  projects = projectModel;
  public projectsService = new projectsService();
  public jobsService = new jobsService();

  public getJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: limit to 20 jobs by default, then limit to 100 max
      const findJobs: Job[] = await this.projects
        .aggregate()
        .match({
          private: { $ne: true },
          'jobs.0': { $exists: true },
        })
        .lookup({
          from: 'jobs',
          localField: 'jobs',
          foreignField: '_id',
          as: 'jobs',
        })
        .unwind('$jobs')
        .replaceRoot({ $mergeObjects: ['$jobs', { project: '$$ROOT' }] })
        .project({ 'project.jobs': 0 });

      res.status(200).json({ data: findJobs, message: 'findAll' });
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
          returnOriginal: false,
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

        res.status(201).json({ data: newJobData, message: 'created' });
        break;
      } catch (error) {
        tries++;
        if (tries === maxTries) next(error);
      }
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

  public subscribeToAJob = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.username) throw new HttpException(401, 'Unauthorized.');

      const jobNumber = parseInt(req.params.jobnumber as string);
      const findProject = await this.projectsService.getProjectByCreatorAndName(req);

      const addSubscriberData = await this.jobs
        .findOneAndUpdate({ project: findProject._id, jobNumber }, { $addToSet: { subscribers: req.username } }, { new: true })
        .populate('project');

      res.status(200).json({ data: addSubscriberData, message: 'subscribed' });
    } catch (error) {
      next(error);
    }
  };

  public unsubscribeFromAJob = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.username) throw new HttpException(401, 'Unauthorized.');

      const jobNumber = parseInt(req.params.jobnumber as string);
      const findProject = await this.projectsService.getProjectByCreatorAndName(req);

      const removeSubscriberData = await this.jobs
        .findOneAndUpdate({ project: findProject._id, jobNumber }, { $pull: { subscribers: req.username } }, { new: true })
        .populate('project');

      res.status(200).json({ data: removeSubscriberData, message: 'unsubscribed' });
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
          returnOriginal: false,
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

        res.status(201).json({ data: newSubmissionData, message: 'created' });
      } catch (error) {
        next(error);
        tries++;
        if (tries === maxTries) next(error);
      }
    }
  };
}

export default JobsController;
