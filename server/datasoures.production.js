'use strict';

let dbConfig = {
  name: 'db',
  connector: 'memory',
};
if (process.env.DATABASE_URL) {
  dbConfig = {
    url: process.env.DATABASE_URL,
    name: 'db',
    connector: 'postgresql',
  };
}

module.exports = {
  db: dbConfig,
};
