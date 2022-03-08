import config from 'config';
import { Auth0Config } from '@/interfaces/auth0-config.interface';
import { ManagementClient, User } from 'auth0';
import { HttpException } from '@/exceptions/HttpException';

const { issuerBaseUrl, clientId, clientSecret }: Auth0Config = config.get('auth0');
const auth0 = new ManagementClient({
  domain: issuerBaseUrl,
  clientId,
  clientSecret,
  scope: 'read:users update:users',
});

class UserService {
  public findUserByUsername = async (username: string): Promise<User> => {
    try {
      const users = await auth0.getUsers({ q: 'username=' + username });
      if (users.length === 0) throw new HttpException(404, `User ${username} not found.`);

      return users[0];
    } catch (err) {
      console.error(err);
      return null;
    }
  };
}
export default UserService;
