const pgp = require('pg-promise')();

const dbConfig = {
    database: 'chartix',
    user: 'postgres',
    password: 'D@n!@l12098',
    host: 'localhost',
    port: 5432, // PostgreSQL default port
};

const db = pgp(dbConfig);

module.exports = db;