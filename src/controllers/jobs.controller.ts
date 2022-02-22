import { NextFunction, Request, Response } from 'express';
import jobModel from '@models/jobs.model';
import userModel from '@models/users.model';
import projectModel from '@models/projects.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@exceptions/HttpException';
import { Job, JobComment } from '@interfaces/job.interface';
import { Project } from '@interfaces/project.interface';
import projectsService from '@services/projects.service';
import jobsService from '@/services/jobs.service';
import jobCommentModel from '@/models/job-comments.model';
import { HydratedDocument, Document } from 'mongoose';
import { User } from '@/interfaces/users.interface';

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
      const findJobs: Job[] = await this.jobs.find().populate('project');

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
  public getJobsByProjectFullPath = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: skip and limit in query
      const findProject = await this.projectsService.getProjectByCreatorAndName(req);
      const jobs = (
        await findProject.populate({
          path: 'jobs',
          options: { perDocumentLimit: 10, sort: { createdAt: -1 } }, // latest 10
        })
      ).jobs;

      res.status(201).json({ data: jobs, message: 'findByProject' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Receive {projectid} param and find jobs by project.
   * Should send response with jobs.sorted
   *
   * @param req
   * @param res
   * @param next
   */
  public getJobsByProjectId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = (req.params.projectid as string).toLocaleLowerCase();
      const findJobsByProject: Job[] = await this.jobsService.getJobsWithNumbers(projectId);

      res.status(201).json({ data: findJobsByProject, message: 'findByProjectId' });
    } catch (error) {
      next(error);
    }
  };

  public createJob = async (req: Request, res: Response, next: NextFunction) => {
    if (isEmpty(req.body)) throw new HttpException(400, 'Requires a JSON body');
    try {
      const findProject = await this.projectsService.getProjectByCreatorAndName(req);
      const newJobData: HydratedDocument<Job> = await this.jobs.create({ project: findProject._id, ...req.body });

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
      const newJobWithJobNumberData = await this.jobs.findByIdAndUpdate(newJobData._id, { jobNumber }, { new: true });

      res.status(201).json({ data: newJobWithJobNumberData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getJobByJobNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobNumber = parseInt(req.params.jobnumber as string);
      const findProject: HydratedDocument<Project> = await this.projectsService.getProjectByCreatorAndName(req);
      const job = findProject.jobs[jobNumber - 1];
      if (!job) throw new HttpException(404, `Job #${jobNumber} doesn't exist`);

      res.status(201).json({ data: job, message: 'findone' });
    } catch (error) {
      next(error);
    }
  };

  public getJobComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobNumber = parseInt(req.params.jobnumber as string);
      const findProject: Project = await this.projectsService.getProjectByCreatorAndName(req);
      const findJobsByProject: Job[] = await this.jobsService.getJobsWithNumbers(findProject?._id.toString());

      const job: Job = findJobsByProject[jobNumber - 1];
      if (!job) throw new HttpException(404, `Job #${jobNumber} doesn't exist`);

      const findCommentsByJob: JobComment[] = await this.jobComments.find({
        job: job._id,
      });

      res.status(201).json({ data: findCommentsByJob, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public postJobComment = async (req: Request, res: Response, next: NextFunction) => {
    if (isEmpty(req.body)) throw new HttpException(400, 'Requires a JSON body');
    try {
      const jobNumber = parseInt(req.params.jobnumber as string);
      const body = req.body.body;
      const findProject: Project = await this.projectsService.getProjectByCreatorAndName(req);
      const findJobsByProject: Job[] = await this.jobsService.getJobsWithNumbers(findProject?._id.toString());

      const job: Job = findJobsByProject[jobNumber - 1];
      if (!job) throw new HttpException(404, `Invalid job number ${jobNumber}`);

      const createCommentData = await this.jobComments.create({
        project: findProject._id,
        job: job._id,
        body,
      });
      res.status(201).json({ data: createCommentData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}

export default JobsController;
