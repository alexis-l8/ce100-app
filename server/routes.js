const Joi = require('joi');

const handlers = require('./handlers.js');

const routes = [
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
          user_type: ['primary', 'admin'],
          submit: 'Submit'
        }
      }
    }
  }
];

module.exports = routes;
