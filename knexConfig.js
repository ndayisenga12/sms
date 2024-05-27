const knex = require('knex');

const knexConfig = {
  client: 'mssql',
  connection: {
    user: 'BAime',
    password: '784367',
    server: '127.0.0.1',
    database: 'SMS',
  }
};

const db = knex(knexConfig);

module.exports = db;
