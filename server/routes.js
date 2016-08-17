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
    handler: handlers.createNewPrimaryUser,
    config: {
      validate: {
        payload: {
          first_name: Joi.string().min(1).required(),
          last_name: Joi.string().min(1).required(),
          email: Joi.string().email().required(),
          organisation_id: Joi.string().min(1).required(),
          user_type: ["primary", "admin"],
          submit: "Submit"
        }
      }
    }
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
