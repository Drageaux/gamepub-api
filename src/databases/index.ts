import config from 'config';
import { dbConfig } from '@interfaces/db.interface';

const { host, port, database, mongodb }: dbConfig = config.get('dbConfig');

export const dbConnection = {
  url: mongodb || `mongodb://${host}:${port}/${database}`,
};
