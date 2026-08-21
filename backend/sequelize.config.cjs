require('dotenv').config();

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

module.exports = {
  development: {
    dialect: 'mssql',
    host: required('DB_HOST'),
    port: Number(process.env.DB_PORT || 1433),
    database: required('DB_NAME'),
    username: required('DB_USER'),
    password: required('DB_PASSWORD'),
    logging: false,
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate:
          process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
      },
    },
  },
};
