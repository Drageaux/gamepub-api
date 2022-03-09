import config from 'config';
import { Auth0Config } from '@/interfaces/auth0-config.interface';
import { ManagementClient, User } from 'auth0';
import { HttpException } from '@/exceptions/HttpException';

const { issuerBaseUrl, clientId, clientSecret }: Auth0Config = config.get('auth0');

const auth0 = new ManagementClient({
  domain: issuerBaseUrl,
  clientId,
  clientSecret,
  scope: 'read:users update:users read:roles read:role_members',
});
auth0.getAccessToken().then(console.log).catch(console.error);

class UserService {
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
}
export default UserService;
