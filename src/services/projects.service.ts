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

  public async updateProjectByCreatorAndName(req: RequestWithUser, update): Promise<HydratedDocument<Project>> {
    const username: string = (req.params.username as string).toLocaleLowerCase();
    const projectname: string = (req.params.projectname as string).toLocaleLowerCase();

    // TODO: what if user is deleted and the project can't be found this way?x

    // TODO: access check, is this project public or does it belong to the user
    const isUser = username === req.username;
    const findProjectByNameData = await this.projects.findByIdAndUpdate({ name: projectname, creator: username }, update);

    if (!findProjectByNameData) throw new HttpException(404, `Project ${projectname} by ${username} does not exist`);
    if (findProjectByNameData.private && !isUser) {
      throw new HttpException(401, `You do not have access to this project`);
    }

    return findProjectByNameData;
  }
}

export default ProjectsService;
