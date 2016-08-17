const Joi = require('joi');

const handlers = require('./handlers.js');

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply('Hello world');
    }
  },
  {
    method: 'GET',
    path: '/{path*}',
    handler: handlers.serveFile
  },
  {
    method: 'POST',
    path: '/add-user',
    handler: handlers.createNewPrimaryUser
  },
  {
    method: 'GET',
    path: '/index2',
    handler: (request, reply) => {
      reply("Request:" + request.query);
    },
    config: {
      validate: {
        query: {
          name: Joi.number()
        }
      }
    }
  }
]

module.exports = routes;
