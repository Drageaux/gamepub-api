process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import 'dotenv/config'; // import first
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import ProjectsRoute from '@routes/projects.route';
import UsersRoute from '@routes/users.route';
import UploadRoute from './routes/upload.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new UploadRoute(), new ProjectsRoute()]);

app.listen();
