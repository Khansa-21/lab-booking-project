import { Sequelize } from 'sequelize';

import { environment } from './environment.js';

const database = environment.database;

export const sequelize = new Sequelize(
  database.name,
  database.user,
  database.password,
  {
    host: database.host,
    port: database.port,
    dialect: 'mssql',
    logging: false,
    dialectOptions: {
      options: {
        encrypt: database.encrypt,
        trustServerCertificate: database.trustServerCertificate,
      },
    },
  },
);

export async function testDatabaseConnection(): Promise<void> {
  await sequelize.authenticate();
}
