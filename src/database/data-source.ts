import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { DataSource, DataSourceOptions, createConnection } from 'typeorm';
import { Account } from '../account/account.entity';
import { Auth } from '../auth/auth.entity';

dotenvExpand.expand(dotenv.config());

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  entities: [Account, Auth],
  url: process.env.POSTGRES_URI,
  migrations: ['dist/database/migrations/*.js'],
  logging: ['error', 'migration', 'query'],

  extra: {
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 0,
  },
};

(async () => {
  try {
    const connection = await createConnection({
      ...dataSourceOptions,
      logging: true,
    });

    await connection.runMigrations({
      transaction: 'all',
    });

    await connection.close();
  } catch (error) {
    throw new Error(error);
  }
})();

export default new DataSource(dataSourceOptions);
