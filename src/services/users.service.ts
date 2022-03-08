import config from 'config';
import { Auth0Config } from '@/interfaces/auth0-config.interface';
import { ManagementClient } from 'auth0';

const { issuerBaseUrl, clientId, clientSecret }: Auth0Config = config.get('auth0');
const auth0 = new ManagementClient({
  domain: issuerBaseUrl,
  clientId,
  clientSecret,
  scope: 'read:users update:users',
});
// const options: AxiosRequestConfig = {
//   method: 'POST',
//   url: 'https://gamepub-dev.us.auth0.com/oauth/token',
//   headers: { 'Content-Type': 'application/json' },
//   data: {
//     client_id: 'FdR0Fv4GojpY4cAd0SZoWcxJXydYsHy1',
//     client_secret: '-KBzmEEvS95Sb3d_kfmcMuuBsKqkFDdG07-QT1W4WkyoYP7K8LnmsAWaDvNB4zc6',
//     audience: 'https://gamepub-dev.us.auth0.com/api/v2/',
//     grant_type: 'client_credentials',
//   },
// };

class UserService {
  public findUserByUsername = async (username: string) => {
    try {
      const users = await auth0.getUsers({ q: 'username=' + username });
      console.log('test', users);

      return users[0];
    } catch (err) {
      console.error(err);
      return null;
    }
  };
}
export default UserService;
