import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import JobsController from '@/controllers/jobs.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { CreateJobCommentDto, CreateJobDto, UpdateJobSubscriptionDto } from '@/dtos/jobs.dto';
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
    this.router.get(`${this.path}`, softCheckUser, injectUsername, this.jobsController.getJobs);

    // PROJECT-SPECIFIC JOB READS, IF PUBLIC OR IF PRIVATE BUT IS OWNER
    // TODO: consider private jobs
    this.router.get(
      `/users/:username/projects/:projectname${this.path}`,
      validationMiddleware(ProjectPathParams, 'params'),
      softCheckUser,
      injectUsername,
      this.jobsController.getJobsByProjectFullPath,
    );
    this.router.get(
      `/users/:username/projects/:projectname${this.path}/:jobnumber`,
      validationMiddleware(JobNumberPathParams, 'params'),
      softCheckUser,
      injectUsername,
      this.jobsController.getJobByJobNumber,
    );
    this.router.get(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/submissions`,
      validationMiddleware(JobNumberPathParams, 'params'),
      softCheckUser,
      injectUsername,
      this.jobsController.getSubmissionsByJobFullPath,
    );
    this.router.get(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/submissions/:submissionnumber`,
      validationMiddleware(JobSubmissionPathParams, 'params'),
      softCheckUser,
      injectUsername,
      this.jobsController.getSubmissionByFullPath,
    );
    // PROJECT-SPECIFIC JOB SUBMISSIONS, REQUIRE USERNAME, IF PUBLIC OR IF PRIVATE BUT IS OWNER
    this.router.put(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/subscription`,
      validationMiddleware(JobNumberPathParams, 'params'),
      validationMiddleware(UpdateJobSubscriptionDto, 'body'),
      requireUser,
      injectUsername,
      this.jobsController.setSubscriptionForJobByJobNumber,
    );
    this.router.delete(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/subscription`,
      validationMiddleware(JobNumberPathParams, 'params'),
      requireUser,
      injectUsername,
      this.jobsController.unsubscribeFromAJob,
    );
    // JOB SUBMISSION CREATE, REQUIRE USERNAME, IF PUBLIC OR IF PRIVATE BUT IS OWNER
    this.router.post(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/submissions`,
      validationMiddleware(JobNumberPathParams, 'params'),
      requireUser,
      injectUsername,
      this.jobsController.postSubmissionByJobNumberFullPath,
    );
    // this.router.get(`/projects/:projectid${this.path}`, this.jobsController.getJobsByProjectId);

    // JOB CREATE & UPDATE, PROJECT OWNER ONLY
    this.router.post(
      `/users/:username/projects/:projectname${this.path}`,
      validationMiddleware(ProjectPathParams, 'params'),
      validationMiddleware(CreateJobDto, 'body'),
      requireUser,
      injectUsername,
      this.jobsController.createJob,
    );
    this.router.patch(
      `/users/:username/projects/:projectname${this.path}/:jobnumber`,
      validationMiddleware(JobNumberPathParams, 'params'),
      validationMiddleware(CreateJobDto, 'body'),
      requireUser,
      injectUsername,
      this.jobsController.createJob,
    );

    // JOB COMMENT READS, PUBLIC OR ALLOW PRIVATE IF IS SAME USER
    this.router.get(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/comments`,
      validationMiddleware(JobNumberPathParams, 'params'),
      softCheckUser,
      injectUsername,
      this.jobsController.getJobComments,
    );
    this.router.get(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/submissions/:submissionnumber/comments`,
      validationMiddleware(JobSubmissionPathParams, 'params'),
      softCheckUser,
      injectUsername,
      this.jobsController.getSubmissionComments,
    );

    // JOB COMMENT CREATE, REQUIRE USER, PUBLIC OR ALLOW PRIVATE IF IS SAME USER
    this.router.post(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/comments`,
      validationMiddleware(JobNumberPathParams, 'params'),
      validationMiddleware(CreateJobCommentDto, 'body'),
      requireUser,
      injectUsername,
      this.jobsController.postJobComment,
    );
    this.router.post(
      `/users/:username/projects/:projectname${this.path}/:jobnumber/submissions/:submissionnumber/comments`,
      validationMiddleware(JobSubmissionPathParams, 'params'),
      validationMiddleware(CreateJobCommentDto, 'body'),
      requireUser,
      injectUsername,
      this.jobsController.postSubmissionComment,
    );
  }
}

export default JobsRoute;
