import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import userService from '@services/users.service';
import { User } from 'auth0';
import { RequestWithUser } from '@/interfaces/auth.interface';

class UsersController {
  public userService = new userService();

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.username;
      console.log(query);
      const foundUsers = await this.userService.listUsers(query);

      res.status(200).json({ data: foundUsers, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  // public getUserById = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId: string = req.params.id;
  //     const findOneUserData: User = await this.userService.findUserById(userId);

  //     res.status(200).json({ data: findOneUserData, message: 'findOne' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const username: string = req.params.username;
      const user: User = await this.userService.findUserByUsername(username);

      res.status(200).json({ data: { username: user.username }, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const createUserData: User = await this.userService.createUser(userData, req);

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  // TODO: If update username, send warnings and create redirects to new project path with new username
  // public updateUser = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId: string = req.params.id;
  //     const userData: CreateUserDto = req.body;
  //     const updateUserData: User = await this.userService.updateUser(userId, userData);

  //     res.status(200).json({ data: updateUserData, message: 'updated' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId: string = req.params.id;
  //     const deleteUserData: User = await this.userService.deleteUser(userId);

  //     res.status(200).json({ data: deleteUserData, message: 'deleted' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}

export default UsersController;
