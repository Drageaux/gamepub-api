import { HydratedDocument } from 'mongoose';
import { HttpException } from '@exceptions/HttpException';
import { Project } from '@interfaces/project.interface';
import { User } from '@interfaces/users.interface';
import projectModel from '@models/projects.model';
import userModel from '@models/users.model';
import { Request } from 'express';

class ProjectsService {
  public users = userModel;
  public projects = projectModel;

  public async getProjectByCreatorAndName(req: Request): Promise<HydratedDocument<Project>> {
    const username: string = (req.params.username as string).toLocaleLowerCase();
    const projectname: string = (req.params.projectname as string).toLocaleLowerCase();
    const user: User = await this.users.findOne({ username });

    // TODO: what if user is deleted and the project can't be found this way?
    if (!user?._id) throw new HttpException(404, `User ${username} does not exist`);

    // TODO: access check, is this project public or does it belong to the user
    const findProjectByNameData = await this.projects.findOne({ name: projectname, creator: user._id }).populate('creator');
    if (!findProjectByNameData) throw new HttpException(404, `Project ${projectname} by ${username} does not exist`);
    return findProjectByNameData;
  }
  // public generateUniformProjectName(projectName: string) {
  //   const result = projectName
  //     .trim()
  //     .toLocaleLowerCase()
  //     .split(' ')
  //     .reduce((prev, curr, index) => {
  //       let res = '';
  //       if (index > 0) {
  //         res += '-';
  //       }
  //       return prev + res + curr;
  //     }, '');
  //   return result;
  // }

  // generateProjectPath(username, projectName) {
  //   return username + '/' + this.generateUniformProjectName(projectName);
  // }
}

export default ProjectsService;
