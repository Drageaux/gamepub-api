import config from 'config';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import { Auth0Config } from '@/interfaces/auth0-config.interface';
import axios from 'axios';

import jwt from 'express-jwt';
import jwks from 'jwks-rsa';

const { issuerBaseUrl, audience }: Auth0Config = config.get('auth0');
// if (!secretKey) console.error('‼️ FATAL ERROR: Auth0 has no secret key');

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

/**
 * Use user's access token to pull userinfo, then inject username.
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const injectUsername = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!req.user) next();
  else {
    const Authorization = req.cookies['Authorization'] || req.header('Authorization').split('Bearer ')[1] || null;
    const url = encodeURI(`${audience}users/${req.user.sub}`); // get full info
    const headers = {
      Authorization: 'Bearer ' + Authorization,
      'Content-Type': 'application/json',
    };

    try {
      if (Authorization && url) {
        const { username } = await getUserInfo(url, headers);
        req.username = username;
      }
      next();
    } catch (err) {
      next(err);
    }
  }
};

const getUserInfo = async (authApiUrl, headers) => {
  const { data } = await axios({
    url: authApiUrl,
    method: 'GET',
    responseType: 'json',
    headers,
  });
  return data;
};
