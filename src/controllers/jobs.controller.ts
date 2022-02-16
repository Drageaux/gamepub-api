import { NextFunction, Request, Response } from 'express';
import jobModel from '@models/jobs.model';
import userModel from '@models/users.model';
import projectModel from '@models/projects.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@exceptions/HttpException';
import { Job } from '@interfaces/job.interface';
import { Project } from '@interfaces/project.interface';
import projectsService from '@services/projects.service';

class JobsController {
  jobs = jobModel;
  projects = projectModel;
  users = userModel;
  public projectsService = new projectsService();

  public createJob = async (req: Request, res: Response, next: NextFunction) => {
    if (isEmpty(req.body)) throw new HttpException(400, 'Requires a JSON body');
    try {
      const findProject: Project = await this.projectsService.getProjectByCreatorAndName(req);

      const createJobData: Job = await this.jobs.create({
        project: findProject._id,
        ...req.body,
      });

      res.status(201).json({ data: createJobData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getJobsByProjectFullPath = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findProject: Project = await this.projectsService.getProjectByCreatorAndName(req);

      const findJobsByProject: Job[] = await this.jobs.find({ project: findProject._id });

      res.status(201).json({ data: findJobsByProject, message: 'findByProject' });
    } catch (error) {
      next(error);
    }
  };
}

export default JobsController;
