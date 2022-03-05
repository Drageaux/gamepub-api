import config from 'config';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import userModel from '@models/users.model';
import { Auth0Config } from '@/interfaces/auth0-config.interface';
import { auth } from 'express-oauth2-jwt-bearer';

const { baseUrl, audience, secretKey }: Auth0Config = config.get('auth0');
if (!secretKey) console.error('‼️ FATAL ERROR: Auth0 has no secret key');

/**
 * Authorization middleware. When used, the Access Token must
 * exist and be verified against the Auth0 JSON Web Key Set.
 */
export const checkJwt = auth({
  audience,
  issuerBaseURL: baseUrl,
});

/**
 * Authorization middleware. Inject user into request if token's user exists.
 * Example use case: list all public projects, but for this user, list both private & public projects.
 *
 * @param req
 * @param res
 * @param next
 */
export const softCheckUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || req.header('Authorization').split('Bearer ')[1] || null;

    if (Authorization) {
      const verificationResponse = (await jwt.verify(Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse._id;
      const findUser = await userModel.findById(userId);

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        // new HttpException(401, 'Wrong authentication token')
        next();
      }
    } else {
      // new HttpException(404, 'Authentication token missing')
      next();
    }
  } catch (error) {
    // new HttpException(404, 'Authentication token missing')
    next();
  }
};

const requireUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || req.header('Authorization').split('Bearer ')[1] || null;

    if (Authorization) {
      const verificationResponse = (await jwt.verify(Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse._id;
      const findUser = await userModel.findById(userId);

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default requireUser;
