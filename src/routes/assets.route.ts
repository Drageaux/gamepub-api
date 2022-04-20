import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import AssetsController from '@/controllers/assets.controller';
import { injectUsername, requireUser, softCheckUser } from '@/middlewares/auth.middleware';
import { UsernamePathParams, PuidPathParams } from '@/dtos/params.dto';
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
      validationMiddleware(UsernamePathParams, 'params'),
      softCheckUser,
      injectUsername,
      this.assetsController.getByUsername,
    );
    this.router.get(
      `${this.path}/:puid`,
      validationMiddleware(PuidPathParams, 'params'),
      softCheckUser,
      injectUsername,
      this.assetsController.getOneByPuid,
    );

    // ONLY ALLOW IF USER
    this.router.post(`${this.path}`, validationMiddleware(CreateAssetDto, 'body'), requireUser, injectUsername, this.assetsController.createOne);

    // ADMIN ONLY
  }
}

export default AssetsRoute;
