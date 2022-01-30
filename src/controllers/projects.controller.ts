import { Project } from '@/interfaces/project.interface';
import { NextFunction, Request, Response } from 'express';
import projectModel from '@/models/projects.model';
import userModel from '@/models/users.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@/exceptions/HttpException';
import projectsService from '@services/projects.service';
import cloudinaryService from '@services/cloudinary.service';
import { User } from '@/interfaces/users.interface';
import { UploadApiResponse, ResourceOptions } from 'cloudinary';

const MAX_PER_PAGE = 100;
const DEFAULT_PER_PAGE = 20;
const DEFAULT_PAGE = 0;

class ProjectsController {
  public projectsService = new projectsService();
  public cloudinaryService = new cloudinaryService();
  projects = projectModel;
  users = userModel;

  public getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const per_page = Math.min(MAX_PER_PAGE, parseInt((req.query.per_page as string) || '0') || DEFAULT_PER_PAGE);
      const page = parseInt(req.query.page as string) || DEFAULT_PAGE;

      // TODO: query with options
      const findAllProjectsData: Project[] = await this.projects
        .find()
        .limit(per_page)
        .skip(per_page * page);

      res.status(200).json({ data: findAllProjectsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId: string = req.params.id;
      const findProjectByIdData: Project = await this.projects.findOne({ _id: projectId }).populate('creator');
      // TODO: access check, is this project public or does it belong to the user

      res.status(200).json({ data: findProjectByIdData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  getProjectByFullPath = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const username: string = req.params.username as string;
      const name: string = (req.params.projectname as string).toLocaleLowerCase();
      const user: User = await this.users.findOne({ username });
      // what if user is deleted and the project can't be found this way?
      if (user === null || !user._id) throw Error(`User ${username} does not exist`);
      const findProjectByNameData: Project = await this.projects.findOne({ name, creator: user._id });
      // TODO: access check, is this project public or does it belong to the user

      res.status(200).json({ data: findProjectByNameData, message: 'findOne' });
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
      const findPopulatedProjectData: Project = await this.projects.findById(createProjectData._id).populate({ path: 'creator', select: 'username' });

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

  public checkName = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const name = req.body.name;
      const creator = req.body.creator;

      const checkIfNameExists: Project = await this.projects.findOne({ creator, name });

      if (checkIfNameExists) {
        res.status(422).json({ message: 'nameDuplicateFound' });
      } else {
        res.status(200).json({ message: 'nameIsAvailable' });
      }
    } catch (error) {
      next(error);
    }
  };

  public updateProjectImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projId = req.params.id;
      const findProjectData: Project = await this.projects.findById(projId);
      if (!findProjectData) throw Error(`Can't find project with ID ${projId}`);

      const image = req.body.image;
      const uploadImageData: UploadApiResponse = await this.cloudinaryService.uploadImage(image, {
        public_id: projId,
        overwrite: true,
        invalidate: true,
      } as ResourceOptions);

      const updateProjectById: Project = await this.projects.findByIdAndUpdate(projId, { imageUrl: uploadImageData.secure_url });
      res.status(200).json({ data: updateProjectById, message: 'updateProjectImage' });
    } catch (error) {
      next(error);
    }
  };
}

export default ProjectsController;
