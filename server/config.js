'use strict';

require('env2')('.env');
var url = require('url');
var params = url.parse(process.env.DATABASE_URL);
var auth = params.auth.split(':');
var paramsTest = url.parse(process.env.DATABASE_URL_TEST);
var authTest = params.auth.split(':');

var dev = {
  env: 'dev',
  port: process.env.PORT || 3000,
  pg: {
    user: auth[0],
    password: auth[1],
    database: params.pathname.split('/')[1],
    host: params.hostname,
    port: params.port,
    max: 10,
    idleTimeoutMillis: 30000
  },
  plugins: {
    tags: {
      reset: Boolean(process.env.RESET_TAGS),
    },
    people: {
      reset: Boolean(process.env.RESET_PEOPLE),
    },
    challenges: {
      reset: Boolean(process.env.RESET_CHALLENGES),
    }
  }
};

var test = {
  env: 'test',
  port: 0,
  pg: {
    user: authTest[0],
    password: authTest[1],
    database: paramsTest.pathname.split('/')[1],
    host: paramsTest.hostname,
    port: paramsTest.port,
    max: 10,
    idleTimeoutMillis: 30000
  },
  plugins: {
    tags: {
      reset: Boolean(process.env.RESET_TAGS_TEST) || true,
    },
    people: {
      reset: Boolean(process.env.RESET_PEOPLE_TEST) || true,
    },
    challenges: {
      reset: Boolean(process.env.RESET_CHALLENGES_TEST) || true,
    }
  }
};

// The default env is test
function setUpConfig () {
  if (process.env.NODE_ENV === 'dev') {
    return dev;
  }

  return test;
}

module.exports = setUpConfig();
