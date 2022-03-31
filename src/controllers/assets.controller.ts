import { NextFunction, Request, Response } from 'express';
import { isEmpty } from '@utils/util';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Asset } from '@/interfaces/asset.interface';
import userModel from '@/models/users.model';
import assetModel from '@/models/assets.model';
import usersService from '@/services/users.service';
import namingService from '@/services/naming.service';

import { customAlphabet } from 'nanoid';

const MAX_PER_PAGE = 100;
const DEFAULT_PER_PAGE = 20;
const DEFAULT_PAGE = 0;

class AssetsController {
  public usersService = new usersService();
  public namingService = new namingService();

  assets = assetModel;
  users = userModel;

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const per_page = Math.min(MAX_PER_PAGE, parseInt((req.query.per_page as string) || '0') || DEFAULT_PER_PAGE);
      const page = parseInt(req.query.page as string) || DEFAULT_PAGE;

      // TODO: query with options
      const findAllData: Asset[] = await this.assets
        .find({ private: { $ne: true } })
        .limit(per_page)
        .skip(per_page * page);
      res.status(200).json({ data: findAllData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAsset = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findOneData: Asset | null = null;

      res.status(200).json({ data: findOneData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public getByUsername = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const username: string = req.params.username;
      const isUser = username === req.username;

      // access check; if is user then include private
      // helpful to keep options in the find() call so that skip() and limit() may follow
      const findByUsername: Asset[] = await this.assets.find({
        creator: username,
        private: this.usersService.getPrivateQueryOptions(isUser),
      });

      res.status(200).json({ data: findByUsername, message: 'findProjectsByUsername' });
    } catch (error) {
      next(error);
    }
  };

  public getOneById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id: string = req.params.id;

      const findByIdData: Asset = await this.assets.findOne({ _id: id });
      const isUser = findByIdData.creator === req.username;

      // access check, is this project public or does it belong to the user?
      if (findByIdData.private && !isUser) {
        throw new HttpException(401, `You do not have access to this project`);
      }

      res.status(200).json({ data: findByIdData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  // public checkName = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  //   try {
  //     const name = req.body.name;
  //     const creator = req.username;

  //     const checkIfNameExists: Project = await this.projects.findOne({ creator, name });

  //     if (checkIfNameExists) {
  //       res.status(422).json({ message: 'nameDuplicateFound' });
  //     } else {
  //       res.status(200).json({ message: 'nameIsAvailable' });
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public createOne = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (isEmpty(req.body)) throw new HttpException(400, 'Bad request.');
    try {
      const username = req.username;
      const { displayName } = req.body;

      // TODO: handle duplicate if applicable
      // const findOne: Asset = await this.assets.findOne({ creator: username, name });
      // if (findOne) throw new HttpException(409, 'Asset already exists.');
      const createData: Asset = await this.assets.create({
        creator: username,
        ...req.body,
        slug: this.namingService.slugify(displayName),
      });

      res.status(201).json({ data: createData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}

export default AssetsController;
