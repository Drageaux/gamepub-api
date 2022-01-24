import { NextFunction, Request, Response } from 'express';
import cloudinaryService from '@services/cloudinary.service';

class UploadController {
  public cloudinaryService = new cloudinaryService();

  public upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const uploadBody = req.body;
      console.log(uploadBody);
      await this.cloudinaryService.uploadImage(uploadBody);

      res.status(201).json({ data: {}, message: 'uploaded' });
    } catch (error) {
      next(error);
    }
  };
}

export default UploadController;
