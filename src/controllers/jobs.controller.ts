import { NextFunction, Request, Response } from 'express';
import jobModel from '@models/jobs.model';
import projectModel from '@models/projects.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@exceptions/HttpException';
import { Job, JobComment } from '@interfaces/job.interface';
import projectsService from '@services/projects.service';
import jobsService from '@/services/jobs.service';
import jobCommentModel from '@/models/job-comments.model';
import jobSubmissionModel from '@/models/job-submissions.model';
import { HydratedDocument, Document } from 'mongoose';
import { RequestWithUser } from '@/interfaces/auth.interface';

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
    if (isEmpty(req.body)) throw new HttpException(400, 'Requires a JSON body');
    try {
      const findProject = await this.projectsService.getProjectByCreatorAndName(req);

      const newJobData: HydratedDocument<Job> = await this.jobs.create({
        project: findProject._id,
        ...req.body,
      });

      res.status(201).json({ data: newJobData, message: 'created' });
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
  public getJobByJobNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findJob = await this.jobsService.getJobByJobNumberWithFullPath(req);

      res.status(200).json({ data: findJob, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public getJobComments = async (req: Request, res: Response, next: NextFunction) => {
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
    if (isEmpty(req.body)) throw new HttpException(400, 'Requires a JSON body');
    try {
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

      res.status(200).json({ data: allSubmissionsData, message: 'getAll' });
    } catch (error) {
      next(error);
    }
  };
}

export default JobsController;
