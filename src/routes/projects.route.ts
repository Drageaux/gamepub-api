import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import ProjectsController from '@/controllers/projects.controller';
import { CreateProjectDto } from '@/dtos/projects.dto';
import express from 'express';
import authMiddleware from '@/middlewares/auth.middleware';

class ProjectsRoute implements Routes {
  public path = '/projects';
  public router = Router();
  public projectsController = new ProjectsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.projectsController.getProjects);
    this.router.get(`/users/:username${this.path}/:projectname`, this.projectsController.getProjectByFullPath);
    this.router.get(`${this.path}/:id`, this.projectsController.getProjectById);
    this.router.put(`${this.path}/:id/image`, this.projectsController.updateProjectImage);
    this.router.get(`/users/:username${this.path}`, this.projectsController.getProjectsByUsername);
    this.router.post(`${this.path}/check-name`, authMiddleware, this.projectsController.checkName);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateProjectDto, 'body'), this.projectsController.createProject);
  }
}

export default ProjectsRoute;
