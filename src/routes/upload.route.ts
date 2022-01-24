import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import UploadController from '@controllers/upload.controller';

class UploadRoute implements Routes {
  public path = '/upload';
  public router = Router();
  public uploadController = new UploadController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(`${this.path}`, this.uploadController.upload);
  }
}

export default UploadRoute;
