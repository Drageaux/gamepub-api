import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import PackagesController from '@/controllers/packages.controller';

class JobsRoute implements Routes {
  public path = '/packages';
  public router = Router();
  packagesController = new PackagesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/unity/:packagename`, this.packagesController.getUnityRegistryPackage);
  }
}

export default JobsRoute;
