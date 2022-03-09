import config from 'config';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import { Auth0Config } from '@/interfaces/auth0-config.interface';

import jwt from 'express-jwt';
import jwks from 'jwks-rsa';
import UserService from '@/services/users.service';
import { HttpException } from '@/exceptions/HttpException';
import { Role } from 'auth0';

const { issuerBaseUrl, audience }: Auth0Config = config.get('auth0');

/**
 * Authorization middleware. When used, the Access Token must
 * exist and be verified against the Auth0 JSON Web Key Set.
 */
const jwtOptions = {
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${issuerBaseUrl}/.well-known/jwks.json`,
  }),
  audience,
  issuer: `https://${issuerBaseUrl}/`,
  algorithms: ['RS256'],
};

/**
 * Authorization middleware. Inject user into request if bare minimum user info exists.
 * Example use case: list all public projects, but for this user, list both private & public projects.
 *
 * @param req
 * @param res
 * @param next
 */
export const softCheckUser = jwt({
  credentialsRequired: false,
  ...jwtOptions,
});

export const requireUser = jwt({
  credentialsRequired: true,
  ...jwtOptions,
});

const usersService = new UserService();

/**
 * Pull userinfo, then inject username.
 * ALWAYS call after jwt has injected data into req.user.
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const injectUsername = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!req.user) next();
  else {
    const id = req.user.sub; // get full info
    try {
      const { username } = await usersService.findUserById(id);
      req.username = username;
      next();
    } catch (err) {
      console.error(err);
      next();
    }
  }
};

export const requireAdmin = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new HttpException(401, "You're not admin");

    const roles: Role[] = await usersService.getUserRoles(req.user.sub);
    if (roles?.length === 0 || !roles.find(x => x.name === 'Site Admin')) {
      throw new HttpException(401, "You're not admin");
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};
