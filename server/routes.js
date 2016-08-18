const Joi = require('joi');

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
    path: '/index',
    handler: (request, reply) => {
      reply.view('add-user');
    }
  },
  {
    method: 'GET',
    path: '/index2',
    handler: (request, reply) => {
      reply('Request:' + request.query);
    },
    config: {
      validate: {
        query: {
          name: Joi.number()
        }
      }
    }
  }
];

module.exports = routes;
