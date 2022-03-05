import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import ProjectsController from '@/controllers/projects.controller';
import { CreateProjectDto } from '@/dtos/projects.dto';
import requireUser, { softCheckUser } from '@/middlewares/auth.middleware';

class ProjectsRoute implements Routes {
  public path = '/projects';
  public router = Router();
  public projectsController = new ProjectsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, softCheckUser, this.projectsController.getProjects);
    this.router.get(`/users/:username${this.path}`, softCheckUser, this.projectsController.getProjectsByUsername);
    this.router.get(`/users/:username${this.path}/:projectname`, softCheckUser, this.projectsController.getProjectByFullPath);
    this.router.get(`${this.path}/:id`, softCheckUser, this.projectsController.getProjectById);

    this.router.put(`${this.path}/:id/image`, requireUser, this.projectsController.updateProjectImage);
    this.router.post(`${this.path}/check-name`, requireUser, this.projectsController.checkName);
    this.router.post(`${this.path}`, requireUser, validationMiddleware(CreateProjectDto, 'body'), this.projectsController.createProject);
  }
}

export default ProjectsRoute;
