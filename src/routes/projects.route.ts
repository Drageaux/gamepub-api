import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import ProjectsController from '@/controllers/projects.controller';

class ProjectsRoute implements Routes {
  public path = '/projects';
  public router = Router();
  public projectsController = new ProjectsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, this.projectsController.getProjectById);
    this.router.post(`${this.path}`, this.projectsController.createProject);
  }
}

export default ProjectsRoute;
