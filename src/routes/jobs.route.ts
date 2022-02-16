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
    this.router.post(`/users/:username/projects/:projectname/jobs`, validationMiddleware(CreateJobDto, 'body'), this.jobsController.createJob);
    this.router.get(`/users/:username/projects/:projectname/jobs`, this.jobsController.getJobsByProjectFullPath);
    this.router.get(`/projects/:projectid/jobs`, this.jobsController.getJobsByProjectId);
  }
}

export default JobsRoute;
