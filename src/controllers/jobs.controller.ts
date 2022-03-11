import { NextFunction, Request, Response } from 'express';
import jobModel from '@models/jobs.model';
import userModel from '@models/users.model';
import projectModel from '@models/projects.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@exceptions/HttpException';
import { Job, JobComment } from '@interfaces/job.interface';
import projectsService from '@services/projects.service';
import jobsService from '@/services/jobs.service';
import jobCommentModel from '@/models/job-comments.model';
import { HydratedDocument, Document } from 'mongoose';
import { RequestWithUser } from '@/interfaces/auth.interface';

class JobsController {
  jobs = jobModel;
  jobComments = jobCommentModel;
  projects = projectModel;
  users = userModel;
  public projectsService = new projectsService();
  public jobsService = new jobsService();

  public getJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: limit to 20 jobs by default, then limit to 100 max
      const findJobs: Job[] = await this.jobs.find().populate({
        path: 'project',
        populate: { path: 'creator' },
      });

      res.status(201).json({ data: findJobs, message: 'findAll' });
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
      const findProject = await this.projectsService.getProjectByCreatorAndName(req);
      const jobs = (
        await findProject.populate({
          path: 'jobs',
          options: { sort: { createdAt: 1 } },
        })
      ).jobs;

      res.status(201).json({ data: jobs, message: 'findByProject' });
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
      const newJobData: HydratedDocument<Job> = await this.jobs.create({ project: findProject._id, ...req.body });

      // suppose there are many pushes at nearly the same moment
      // they will still be sorted by creation date before getting assigned a job number
      const updateProject = await this.projects
        .findByIdAndUpdate(
          findProject._id,
          {
            $push: {
              jobs: newJobData._id,
            },
          },
          { new: true },
        )
        .populate('jobs')
        .sort({ createdAt: 1 }); // sort to add number

      const jobNumber = updateProject.jobs.findIndex(x => x._id.toString() == newJobData._id.toString()) + 1;
      if (jobNumber == 0) throw new HttpException(404, `Error creating job`);

      const newJobWithJobNumberData = await this.jobs.findByIdAndUpdate(newJobData._id, { jobNumber }, { new: true });

      res.status(201).json({ data: newJobWithJobNumberData, message: 'created' });
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

      res.status(201).json({ data: findJob, message: 'findOne' });
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

      res.status(201).json({ data: findCommentsByJob, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public postJobComment = async (req: Request, res: Response, next: NextFunction) => {
    if (isEmpty(req.body)) throw new HttpException(400, 'Requires a JSON body');
    try {
      const body = req.body.body;
      const findJob = await this.jobsService.getJobByJobNumberWithFullPath(req);
      const createCommentData = await this.jobComments.create({
        project: findJob.project,
        job: findJob._id,
        body,
      });

      res.status(201).json({ data: createCommentData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}

export default JobsController;
