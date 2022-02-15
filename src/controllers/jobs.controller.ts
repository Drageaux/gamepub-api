import { NextFunction, Request, Response } from 'express';
import jobModel from '@/models/jobs.model';
import userModel from '@/models/users.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@/exceptions/HttpException';
import projectsService from '@services/projects.service';

class JobsController {
  public projectsService = new projectsService();
  jobs = jobModel;
  users = userModel;

  public createJob = async (req: Request, res: Response, next: NextFunction) => {
    if (isEmpty(req.body)) throw new HttpException(400, "You're not userData");
    try {
      const createJobData: Job = await this.jobs.create({
        ...req.body,
      });
      // const findPopulatedProjectData: Project = await this.projects.findById(createJobData._id).populate({ path: 'creator', select: 'username' });

      // res.status(201).json({ data: findPopulatedProjectData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}

export default JobsController;
