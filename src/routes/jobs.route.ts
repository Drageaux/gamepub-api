import { CreateJobCommentDto } from './../dtos/jobs.dto';
import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import JobsController from '@/controllers/jobs.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { CreateJobDto } from '@/dtos/jobs.dto';

class JobsRoute implements Routes {
  public path = '/jobs';
  public router = Router();
  public jobsController = new JobsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // public jobs
    this.router.get(`${this.path}`, this.jobsController.getJobs);

    // project-specific jobs
    this.router.get(`/users/:username/projects/:projectname/jobs`, this.jobsController.getJobsByProjectFullPath);
    this.router.get(`/users/:username/projects/:projectname/jobs/:jobnumber`, this.jobsController.getJobByJobNumber);
    this.router.get(`/projects/:projectid/jobs`, this.jobsController.getJobsByProjectId);
    this.router.post(`/users/:username/projects/:projectname/jobs`, validationMiddleware(CreateJobDto, 'body'), this.jobsController.createJob);
    // job comments
    this.router.get(`/users/:username/projects/:projectname/jobs/:jobnumber/comments`, this.jobsController.getJobComments);
    this.router.post(
      `/users/:username/projects/:projectname/jobs/:jobnumber/comments`,
      validationMiddleware(CreateJobCommentDto, 'body'),
      this.jobsController.postJobComment,
    );
  }
}

export default JobsRoute;
