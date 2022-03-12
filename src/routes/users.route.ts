import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { injectUsername, requireAdmin, requireUser, softCheckUser } from '@/middlewares/auth.middleware';
import { UsernamePathParams } from '@/dtos/params.dto';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, requireUser, requireAdmin, this.usersController.getUsers);
    // TODO: hide private user information with soft JWT check and username injection
    this.router.get(`${this.path}/:username`, validationMiddleware(UsernamePathParams, 'params'), this.usersController.getUserByUsername);
    // this.router.get(`${this.path}/:id`, this.usersController.getUserById);
    this.router.post(`${this.path}`, requireUser, requireAdmin, validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    // this.router.put(`${this.path}/:id`, validationMiddleware(CreateUserDto, 'body', true), this.usersController.updateUser);
    // this.router.delete(`${this.path}/:id`, this.usersController.deleteUser);
  }
}

export default UsersRoute;
