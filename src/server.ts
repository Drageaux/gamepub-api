process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import ProjectsRoute from '@routes/projects.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import 'dotenv/config';
import UploadRoute from './routes/upload.route';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new UploadRoute(), new ProjectsRoute()]);

app.listen();
