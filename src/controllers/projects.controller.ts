import { Project } from '@/interfaces/project.interface';
import { NextFunction, Request, Response } from 'express';
import projectModel from '@/models/projects.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@/exceptions/HttpException';

class ProjectsController {
  projects = projectModel;

  // public getUsers = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const findAllUsersData: User[] = await this.userService.findAllUser();

  //     res.status(200).json({ data: findAllUsersData, message: 'findAll' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId: string = req.params.id;
      console.log(projectId);
      const findProjectByIdData: Project = await this.projects.findOne({ _id: projectId }).populate('creator');
      // TODO: access check, is this project public or does it belong to the user

      res.status(200).json({ data: findProjectByIdData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createProject = async (req: Request, res: Response, next: NextFunction) => {
    if (isEmpty(req.body)) throw new HttpException(400, "You're not userData");
    try {
      const createProjectData: Project = await this.projects.create({
        ...req.body,
      });
      res.status(201).json({ data: createProjectData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}

export default ProjectsController;
