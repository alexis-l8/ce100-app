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
    path: '/add-user',
    handler: (request, reply) => {
      reply.view('add-user');
    }
  },
  {
    method: 'POST',
    path: '/add-user',
    handler: (request, reply) => {
      const stringified = JSON.stringify(request.payload);
      // make new db

      request.redis.SADD('users', stringified);
      reply.view('add-user');
    }
  }
];

module.exports = routes;
