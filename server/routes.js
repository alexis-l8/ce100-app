const validate = require('./joi.js');
const handlers = require('./handlers.js');

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => reply('Hello World')
  },
  {
    method: 'GET',
    path: '/people/{action}/{hashedId}',
    handler: handlers.serveActivate
  },
  {
    method: 'POST',
    path: '/people/activate/{hashedId}',
    handler: handlers.activatePrimaryUser,
    config: {
      validate: validate.confirmPassword
    }
  },
  {
    method: 'POST',
    path: '/login',
    handler: handlers.login,
    config: {
      validate: validate.login
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
      validate: validate.adminAddUser
    }
  }
];

module.exports = routes;
