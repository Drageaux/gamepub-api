import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import ProjectsController from '@/controllers/projects.controller';
import { AdminCreateProjectDto, CheckProjectNameDto, CreateProjectDto, PatchProjectPrivacyDto } from '@/dtos/projects.dto';
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
      validationMiddleware(UsernamePathParams, 'params'),
      softCheckUser,
      injectUsername,
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
      validationMiddleware(IdPathParams, 'params'),
      softCheckUser,
      injectUsername,
      this.projectsController.getProjectById,
    );

    // ONLY ALLOW IF OWNER
    this.router.post(
      `${this.path}/check-name`,
      validationMiddleware(CheckProjectNameDto, 'body'),
      requireUser,
      injectUsername,
      this.projectsController.checkName,
    );
    this.router.post(
      `${this.path}`,
      validationMiddleware(CreateProjectDto, 'body'),
      requireUser,
      injectUsername,
      this.projectsController.createProject,
    );
    this.router.put(
      `${this.path}/:id/image`,
      validationMiddleware(IdPathParams, 'params'),
      requireUser,
      injectUsername,
      this.projectsController.updateProjectImage,
    );
    this.router.patch(
      `${this.path}/:id`,
      validationMiddleware(IdPathParams, 'params'),
      validationMiddleware(PatchProjectPrivacyDto, 'body'),
      requireUser,
      injectUsername,
      this.projectsController.patchProjectById,
    );
    this.router.patch(
      `/users/:username${this.path}/:projectname`,
      validationMiddleware(ProjectPathParams, 'params'),
      validationMiddleware(PatchProjectPrivacyDto, 'body'),
      requireUser,
      injectUsername,
      this.projectsController.patchProjectByFullPath,
    );

    // ADMIN ONLY
    this.router.post(
      `/admin${this.path}`,
      validationMiddleware(AdminCreateProjectDto, 'body'),
      requireUser,
      injectUsername,
      requireAdmin,
      this.projectsController.adminCreateProject,
    );
  }
}

export default ProjectsRoute;
