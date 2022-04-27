import fetch from 'node-fetch';
import { HttpException } from '@/exceptions/HttpException';
import { NextFunction, Request, Response } from 'express';

class PackagesController {
  private unityPackagesUrl = 'https://packages-v2.unity.com';
  private openUpmPackagesUrl = 'https://package.openupm.com';

  public getUnityRegistryPackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const packageName = req.params.packagename;
      if (!packageName) throw new HttpException(400, 'Please provide a proper package name');

      console.log(`${this.unityPackagesUrl}/${packageName}`);
      const packageData = await fetch(`${this.unityPackagesUrl}/${packageName}`);

      res.status(200).json({ data: packageData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
}

export default PackagesController;
