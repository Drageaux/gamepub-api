import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import AssetsController from '@/controllers/assets.controller';
import { AdminCreateProjectDto, CheckProjectNameDto, CreateProjectDto } from '@/dtos/projects.dto';
import { injectUsername, requireAdmin, requireUser, softCheckUser } from '@/middlewares/auth.middleware';
import { IdPathParams, UsernamePathParams, ProjectPathParams, PuidPathParams } from '@/dtos/params.dto';
import { CreateAssetDto } from '@/dtos/assets.dto';

class AssetsRoute implements Routes {
  public path = '/assets';
  public router = Router();
  public assetsController = new AssetsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // PUBLIC
    this.router.get(`${this.path}`, this.assetsController.getAll);

    // PUBLIC OR ALLOW PRIVATE IF IS SAME USER
    this.router.get(
      `/users/:username${this.path}`,
      softCheckUser,
      injectUsername,
      validationMiddleware(UsernamePathParams, 'params'),
      this.assetsController.getByUsername,
    );
    this.router.get(
      `${this.path}/:puid`,
      softCheckUser,
      injectUsername,
      validationMiddleware(PuidPathParams, 'params'),
      this.assetsController.getOneByPuid,
    );

    // ONLY ALLOW IF USER
    this.router.post(`${this.path}`, requireUser, injectUsername, validationMiddleware(CreateAssetDto, 'body'), this.assetsController.createOne);

    // ADMIN ONLY
  }
}

export default AssetsRoute;
