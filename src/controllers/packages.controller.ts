import { HttpException } from '@/exceptions/HttpException';
import { NextFunction, Request, Response } from 'express';
import axios from 'axios';

class PackagesController {
  // private unityPackagesUrl = 'https://packages-v2.unity.com';
  private unityPackagesUrl = 'https://packages.unity.com';
  private openUpmPackagesUrl = 'https://package.openupm.com';

  public getUnityRegistryPackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const packageName = req.params.packagename;
      if (!packageName) throw new HttpException(400, 'Please provide a proper package name');

      const response = await axios(`${this.unityPackagesUrl}/${packageName}`);
      const packageData = await response.data;
      if (!packageData) throw new HttpException(404, 'Cannot find package');

      res.status(200).json({ data: packageData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public getOpenUpmRegistryPackage = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: search multiple packages in a module/scope
    try {
      const packageName = req.params.packagename;
      if (!packageName) throw new HttpException(400, 'Please provide a proper package name');

      const response = await axios(`${this.openUpmPackagesUrl}/${packageName}`);
      const packageData = await response.data;
      if (!packageData) throw new HttpException(404, 'Cannot find package');

      res.status(200).json({ data: packageData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
}

export default PackagesController;
