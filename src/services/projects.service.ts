import { HydratedDocument } from 'mongoose';
import { HttpException } from '@exceptions/HttpException';
import { Project } from '@interfaces/project.interface';
import projectModel from '@models/projects.model';
import { RequestWithUser } from '@/interfaces/auth.interface';

class ProjectsService {
  public projects = projectModel;

  public async getProjectByCreatorAndName(req: RequestWithUser): Promise<HydratedDocument<Project>> {
    const username: string = (req.params.username as string).toLocaleLowerCase();
    const projectname: string = (req.params.projectname as string).toLocaleLowerCase();

    // TODO: what if user is deleted and the project can't be found this way?x

    // TODO: access check, is this project public or does it belong to the user
    const isUser = username === req.username;
    const findProjectByNameData = await this.projects.findOne({ name: projectname, creator: username });

    if (!findProjectByNameData) throw new HttpException(404, `Project ${projectname} by ${username} does not exist`);
    if (findProjectByNameData.private && !isUser) {
      throw new HttpException(401, `You do not have access to this project`);
    }

    return findProjectByNameData;
  }

  public async updateProjectById(req: RequestWithUser, update): Promise<HydratedDocument<Project>> {
    if (!req.username) throw new HttpException(401, `Unauthorized`);

    const findProject = await this.projects.findById(req.params.id);
    if (!findProject) throw new HttpException(404, `Project with ID ${req.params.id} does not exist`);

    // TODO: allow collaborators to edit
    // access check, does it belong to the user
    if (req.username !== findProject.creator) throw new HttpException(401, `Unauthorized`);

    const findProjectByNameData = await this.projects.findByIdAndUpdate(req.params.id, update, { returnOriginal: false });

    return findProjectByNameData;
  }

  public async updateProjectByCreatorAndName(req: RequestWithUser, update): Promise<HydratedDocument<Project>> {
    const username: string = (req.params.username as string).toLocaleLowerCase();
    const projectname: string = (req.params.projectname as string).toLocaleLowerCase();

    // TODO: allow collaborators to edit
    // TODO: what if user is deleted and the project can't be found this way?

    // access check, does it belong to the user
    const isUser = username === req.username;
    if (!isUser) throw new HttpException(401, `You do not have access to this project`);

    const findProjectByNameData = await this.projects.findOneAndUpdate({ name: projectname, creator: username }, update, {
      returnOriginal: false,
    });
    if (!findProjectByNameData) throw new HttpException(404, `Project ${projectname} by ${username} does not exist`);

    return findProjectByNameData;
  }
}

export default ProjectsService;
