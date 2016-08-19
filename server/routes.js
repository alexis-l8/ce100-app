const Joi = require('joi');

const handlers = require('./handlers.js');

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => reply("Hello World")
  },
  {
    method: 'POST',
    path: '/register',
    handler: handlers.register
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
          organisation_id: Joi.number().min(0).required(),
          user_type: ['primary', 'admin'],
          submit: 'Submit'
        }
      }
    }
  }
];

module.exports = routes;
