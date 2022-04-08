import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import JobsController from '@/controllers/jobs.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { CreateJobCommentDto, CreateJobDto } from '@/dtos/jobs.dto';
import { softCheckUser, injectUsername, requireUser } from '@/middlewares/auth.middleware';
import { JobNumberPathParams, JobSubmissionPathParams, ProjectPathParams } from '@/dtos/params.dto';

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

    // PROJECT SPECIFIC JOBS, IF PUBLIC OR IF PRIVATE BUT IS OWNER
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
    // PROJECT SPECIFIC JOBS, REQUIRE USERNAME, IF PUBLIC OR IF PRIVATE BUT IS OWNER
    this.router.put(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/subscribe`,
      requireUser,
      injectUsername,
      validationMiddleware(JobNumberPathParams, 'params'),
      this.jobsController.subscribeToAJob,
    );
    this.router.put(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/unsubscribe`,
      requireUser,
      injectUsername,
      validationMiddleware(JobNumberPathParams, 'params'),
      this.jobsController.unsubscribeFromAJob,
    );
    // JOB SUBMISSIONS, REQUIRE USERNAME, IF PUBLIC OR IF PRIVATE BUT IS OWNER
    this.router.get(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/submissions`,
      requireUser,
      injectUsername,
      validationMiddleware(JobNumberPathParams, 'params'),
      this.jobsController.getSubmissionsByJobFullPath,
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

    // JOB COMMENTS, PUBLIC OR ALLOW PRIVATE IF IS SAME USER
    this.router.get(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/comments`,
      softCheckUser,
      injectUsername,
      validationMiddleware(JobNumberPathParams, 'params'),
      this.jobsController.getJobComments,
    );
    this.router.post(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/comments`,
      softCheckUser,
      injectUsername,
      validationMiddleware(JobNumberPathParams, 'params'),
      validationMiddleware(CreateJobCommentDto, 'body'),
      this.jobsController.postJobComment,
    );
  }
}

export default JobsRoute;
