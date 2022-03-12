import config from 'config';
import { Auth0Config } from '@/interfaces/auth0-config.interface';
import { ManagementClient, User } from 'auth0';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';

const { issuerBaseUrl, clientId, clientSecret }: Auth0Config = config.get('auth0');

const auth0 = new ManagementClient({
  domain: issuerBaseUrl,
  clientId,
  clientSecret,
  scope: `read:users create:users update:users delete:users read:roles read:role_members create:role_members`,
  retry: {
    enabled: true,
    maxRetries: 3,
  },
});
// auth0.getAccessToken().then(console.log).catch(console.error);

class UserService {
  public listUsers = async query => {
    const users = await auth0.getUsers({ q: query });
    return users;
  };

  public findUserByUsername = async (username: string): Promise<User> => {
    const users = await auth0.getUsers({ q: 'username=' + username });
    if (users.length === 0) throw new HttpException(404, `User ${username} not found.`);

    return users[0];
  };

  public findUserById = async (id: string): Promise<User> => {
    const user = await auth0.getUser({ id });
    if (!user) throw new HttpException(404, `User not found.`);

    return user;
  };

  public getUserRoles = async (id: string) => {
    return await auth0.getUserRoles({ id });
  };

  public isAdmin = async (id: string) => {
    const roles = await this.getUserRoles(id);
    return !!roles.find(x => x.name === 'Site Admin');
  };

  /*************************************************************************/
  /********************************* ADMIN *********************************/
  /*************************************************************************/
  public createUser = async (newUser: User, req: RequestWithUser) => {
    if (this.isAdmin(req.user.sub)) {
      try {
        const createdUser = await auth0.createUser({ ...newUser, connection: 'Username-Password-Authentication' });
        if (createdUser) return createdUser;
        else throw new HttpException(400, 'Could not create user');
      } catch (err) {
        if (err?.originalError?.status === 409) {
          throw new HttpException(409, 'The user already exists.');
        } else {
          console.error(err);
          throw new HttpException(400, 'Could not process this request.');
        }
      }
    } else throw new HttpException(401, 'You are not admin.');
  };
}

export default UserService;
