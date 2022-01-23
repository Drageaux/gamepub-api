import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import ProjectsController from '@/controllers/projects.controller';
import { CreateProjectDto } from '@/dtos/projects.dto';

class ProjectsRoute implements Routes {
  public path = '/projects';
  public router = Router();
  public projectsController = new ProjectsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/users/:username${this.path}/:projectname`, this.projectsController.getProjectByFullPath);
    this.router.get(`${this.path}/:id`, this.projectsController.getProjectById);
    this.router.get(`/users/:username${this.path}`, this.projectsController.getProjectsByUsername);
    this.router.post(`${this.path}`, validationMiddleware(CreateProjectDto, 'body'), this.projectsController.createProject);
  }
}

export default ProjectsRoute;
