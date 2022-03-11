import { CreateJobCommentDto } from './../dtos/jobs.dto';
import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import JobsController from '@/controllers/jobs.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { CreateJobDto } from '@/dtos/jobs.dto';
import { softCheckUser, injectUsername, requireUser } from '@/middlewares/auth.middleware';
import { JobNumberPathParams, ProjectPathParams } from '@/dtos/params.dto';

class JobsRoute implements Routes {
  public path = '/jobs';
  public router = Router();
  public jobsController = new JobsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // PUBLIC JOBS
    this.router.get(`${this.path}`, this.jobsController.getJobs);

    // PROJECT SPECIFIC JOBS, PUBLIC OR ALLOW PRIVATE IF IS SAME USER
    // TODO: consider private jobs
    this.router.get(
      `/users/:username/projects/:projectname${this.path}`,
      softCheckUser,
      injectUsername,
      validationMiddleware(ProjectPathParams, 'params'),
      this.jobsController.getJobsByProjectFullPath,
    );
    this.router.get(
      `/users/:username/projects/:projectname${this.path}/:jobnumber`,
      softCheckUser,
      injectUsername,
      validationMiddleware(JobNumberPathParams, 'params'),
      this.jobsController.getJobByJobNumber,
    );
    // this.router.get(`/projects/:projectid${this.path}`, this.jobsController.getJobsByProjectId);

    // JOB'S PROJECT OWNER ONLY
    this.router.post(
      `/users/:username/projects/:projectname${this.path}`,
      requireUser,
      injectUsername,
      validationMiddleware(ProjectPathParams, 'params'),
      validationMiddleware(CreateJobDto, 'body'),
      this.jobsController.createJob,
    );

    // JOB COMMENTS
    this.router.get(`/users/:username/projects/:projectname${this.path}/:jobnumber/comments`, this.jobsController.getJobComments);
    this.router.post(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/comments`,
      validationMiddleware(CreateJobCommentDto, 'body'),
      this.jobsController.postJobComment,
    );
  }
}

export default JobsRoute;
