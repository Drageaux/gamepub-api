import { Project } from '@/interfaces/project.interface';
import { NextFunction, Request, Response } from 'express';
import projectModel from '@/models/projects.model';
import userModel from '@/models/users.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@/exceptions/HttpException';
import projectsService from '@services/projects.service';
import { CreateProjectDto } from '@/dtos/projects.dto';

class ProjectsController {
  public projectsService = new projectsService();
  projects = projectModel;
  users = userModel;

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
      const findProjectByIdData: Project = await this.projects.findOne({ _id: projectId });
      // TODO: access check, is this project public or does it belong to the user

      res.status(200).json({ data: findProjectByIdData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createProject = async (req: Request, res: Response, next: NextFunction) => {
    if (isEmpty(req.body)) throw new HttpException(400, "You're not userData");
    try {
      const formattedProjName = this.projectsService.generateUniformProjectName(req.body.displayName);
      const createProjectData: Project = await this.projects.create({
        ...req.body,
        name: formattedProjName,
      });
      const findPopulatedProjectData: Project = await this.projects.findById(createProjectData._id).populate('creator');

      res.status(201).json({ data: findPopulatedProjectData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getProjectsByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const username: string = req.params.username;

      const { _id } = await this.users.findOne({ username });
      console.log(_id);
      const findProjectsByUsername: Project[] = await this.projects.find({ creator: _id });
      // TODO: access check, is this project public or does it belong to the user

      res.status(200).json({ data: findProjectsByUsername, message: 'findProjectsByUsername' });
    } catch (error) {
      next(error);
    }
  };
}

export default ProjectsController;
