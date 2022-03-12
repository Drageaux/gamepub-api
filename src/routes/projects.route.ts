import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import ProjectsController from '@/controllers/projects.controller';
import { AdminCreateProjectDto, CreateProjectDto } from '@/dtos/projects.dto';
import { injectUsername, requireAdmin, requireUser, softCheckUser } from '@/middlewares/auth.middleware';
import { IdPathParams, UsernamePathParams, ProjectPathParams } from '@/dtos/params.dto';

class ProjectsRoute implements Routes {
  public path = '/projects';
  public router = Router();
  public projectsController = new ProjectsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // PUBLIC
    this.router.get(`${this.path}`, this.projectsController.getProjects);

    // PUBLIC OR ALLOW PRIVATE IF IS SAME USER
    this.router.get(
      `/users/:username${this.path}`,
      softCheckUser,
      injectUsername,
      validationMiddleware(UsernamePathParams, 'params'),
      this.projectsController.getProjectsByUsername,
    );
    this.router.get(
      `/users/:username${this.path}/:projectname`,
      validationMiddleware(ProjectPathParams, 'params'),
      softCheckUser,
      injectUsername,
      this.projectsController.getProjectByFullPath,
    );
    this.router.get(
      `${this.path}/:id`,
      softCheckUser,
      injectUsername,
      validationMiddleware(IdPathParams, 'params'),
      this.projectsController.getProjectById,
    );

    // ONLY ALLOW IF USER
    this.router.post(`${this.path}/check-name`, requireUser, injectUsername, this.projectsController.checkName);
    this.router.post(
      `${this.path}`,
      requireUser,
      injectUsername,
      validationMiddleware(CreateProjectDto, 'body'),
      this.projectsController.createProject,
    );
    this.router.put(
      `${this.path}/:id/image`,
      requireUser,
      injectUsername,
      validationMiddleware(IdPathParams, 'params'),
      this.projectsController.updateProjectImage,
    );

    // ADMIN ONLY
    this.router.post(
      `/admin${this.path}`,
      requireUser,
      injectUsername,
      requireAdmin,
      validationMiddleware(AdminCreateProjectDto, 'body'),
      this.projectsController.adminCreateProject,
    );
  }
}

export default ProjectsRoute;
