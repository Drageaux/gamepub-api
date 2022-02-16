import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import JobsController from '@/controllers/jobs.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { CreateJobDto } from '@/dtos/jobs.dto';

class JobsRoute implements Routes {
  public path = '/projects';
  public router = Router();
  public jobsController = new JobsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`/users/:username${this.path}/:projectname/jobs`, validationMiddleware(CreateJobDto, 'body'), this.jobsController.createJob);
  }
}

export default JobsRoute;
