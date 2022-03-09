import config from 'config';
import { Auth0Config } from '@/interfaces/auth0-config.interface';
import { ManagementClient, User } from 'auth0';
import { HttpException } from '@/exceptions/HttpException';

const { issuerBaseUrl, clientId, clientSecret }: Auth0Config = config.get('auth0');

class UserService {
  private auth0 = new ManagementClient({
    domain: issuerBaseUrl,
    clientId,
    clientSecret,
    scope: 'read:users update:users',
  });

  public findUserByUsername = async (username: string): Promise<User> => {
    const users = await this.auth0.getUsers({ q: 'username=' + username });
    if (users.length === 0) throw new HttpException(404, `User ${username} not found.`);

    return users[0];
  };

  public findUserById = async (id: string): Promise<User> => {
    const user = await this.auth0.getUser({ id });
    return user;
  };
}
export default UserService;
