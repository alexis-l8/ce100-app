const val = require('./joi.js');
const handlers = require('./handlers.js');

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => reply('Hello World')
  },
  {
    method: 'GET',
    path: '/users/{action}/{hashedId}',
    handler: handlers.serveActivate
  },
  {
    method: 'POST',
    path: '/users/activate/{hashedId}',
    handler: handlers.activateUser,
    config: {
      validate: val.confirmPassword
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
      validate: val.adminAddUser
    }
  }
];

module.exports = routes;
