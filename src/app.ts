process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import config from 'config';
import express from 'express';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set } from 'mongoose';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { cloudinaryConfig } from '@interfaces/cloudinary-config.interface';
import cloudinary from 'cloudinary';

import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { dbConnection } from '@databases';
import { Routes } from '@interfaces/routes.interface';

class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.env = process.env.NODE_ENV || 'development';

    this.connectToDatabase();
    this.configureCloudinary();
    // Init routes first to declare endpoint-specific middleware (file size limit)
    // NOT sure of the consequences, but for now it works
    this.initializeRoutes(routes);
    this.initializeMiddlewares();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }

    // IMPORTANT: If changing IP, need to allow in online Network Access
    connect(dbConnection.url, dbConnection.options, err => {
      if (err) console.error(err);
    });
  }

  private configureCloudinary() {
    const cldnry = cloudinary.v2;
    const { name, key, secret }: cloudinaryConfig = config.get('cloudinary');
    cldnry.config({
      cloud_name: name,
      api_key: key,
      api_secret: secret,
    });
  }

  private initializeMiddlewares() {
    this.app.use(morgan(config.get('log.format'), { stream }));
    this.app.use(cors({ origin: config.get('cors.origin'), credentials: config.get('cors.credentials') }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
