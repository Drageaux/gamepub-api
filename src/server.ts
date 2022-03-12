process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import 'dotenv/config'; // import first
import App from '@/app';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import ProjectsRoute from '@routes/projects.route';
import UploadRoute from '@routes/upload.route';
import JobsRoute from '@routes/jobs.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new UploadRoute(), new ProjectsRoute(), new JobsRoute()]);

app.listen();
