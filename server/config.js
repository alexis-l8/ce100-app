'use strict';
/* eslint-disable */
require('env2')('.env');
var url = require('url');
var env = process.env
var params = url.parse(env.DATABASE_URL);
var auth = params.auth.split(':');
var paramsTest = url.parse(env.DATABASE_URL_TEST);
var authTest = params.auth.split(':');

// DATA
var mockData = require('ce100-mock-data');
var productionTags = require('../tags/tags.json');
var productionCategories = require('../tags/categories.json');


var prod = {
  env: 'production',
  damApiUrl: 'http://139.162.209.82',
  data: {
    tags: productionTags,
    categories: productionCategories
  }
};

var dev = {
  env: 'dev',
  port: env.PORT || 3000,
  jwt_secret: env.JWT_SECRET,
  damApiUrl: 'http://139.162.209.82',
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
    },
    insights: {
      reset: Boolean(process.env.RESET_INSIGHTS),
    }
  },
  s3: {
    region: env.S3_REGION,
    bucket: env.S3_BUCKET
  },
  root_url: env.ROOT_URL,
  data: {
    tags: mockData.tags,
    categories: mockData.categories
  }
};



var test = {
  env: 'test',
  port: 0,
  damApiUrl: 'http://139.162.209.82',
  pg: {
    user: authTest[0],
    password: authTest[1],
    database: paramsTest.pathname.split('/')[1],
    host: paramsTest.hostname,
    port: paramsTest.port,
    max: 10,
    idleTimeoutMillis: 1
  },
  plugins: {
    tags: {
      reset: Boolean(env.RESET_TAGS_TEST) || true,
    },
    people: {
      reset: Boolean(env.RESET_PEOPLE_TEST) || true,
    },
    challenges: {
      reset: Boolean(process.env.RESET_CHALLENGES_TEST) || true,
    },
    insights: {
      reset: Boolean(process.env.RESET_INSIGHTS_TEST) || true,
    }
  }
};

// The default env is test
function setUpConfig () {
  if (env.NODE_ENV === 'dev') {
    return dev;
  } else if (env.NODE_ENV === 'production') {
    return Object.assign({}, dev, prod)
  }

  return Object.assign({}, dev, test);
}

module.exports = setUpConfig();
