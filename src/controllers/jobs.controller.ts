import { NextFunction, Request, Response } from 'express';
import jobModel from '@models/jobs.model';
import userModel from '@models/users.model';
import projectModel from '@models/projects.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@exceptions/HttpException';
import { Job } from '@interfaces/job.interface';
import { Project } from '@interfaces/project.interface';
import projectsService from '@services/projects.service';
import jobsService from '@/services/jobs.service';

class JobsController {
  jobs = jobModel;
  projects = projectModel;
  users = userModel;
  public projectsService = new projectsService();
  public jobsService = new jobsService();

  /**
   * Receive {username} and {projectname} params and find jobs by project.
   *
   * @param req
   * @param res
   * @param next
   */
  public getJobsByProjectFullPath = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findProject: Project = await this.projectsService.getProjectByCreatorAndName(req);
      const findJobsByProject: Job[] = await this.jobsService.getJobsWithNumbers(findProject?._id.toString());

      res.status(201).json({ data: findJobsByProject, message: 'findByProject' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Receive {projectid} param and find jobs by project.
   * Should send response with jobs.sorted
   *
   * @param req
   * @param res
   * @param next
   */
  public getJobsByProjectId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = (req.params.projectid as string).toLocaleLowerCase();
      const findJobsByProject: Job[] = await this.jobsService.getJobsWithNumbers(projectId);

      res.status(201).json({ data: findJobsByProject, message: 'findByProjectId' });
    } catch (error) {
      next(error);
    }
  };

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
}

export default JobsController;
