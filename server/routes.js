const validate = require('./joi.js');
const handlers = require('./handlers.js');

// TODO: check routes

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: handlers.checkUser, // replace with handlers.serveSpecificFile('dashboard')
    config: { auth: false }
  },
  {
    method: 'GET',
    path: '/get',
    handler: (request, reply) => {
      // console.log(request.auth);
      reply('Hello World');
    },
    config: {
      auth: false // {
      //   scope: 'primary'
      // }
    }
  },
  {
    method: 'GET',
    path: '/set',
    handler: (request, reply) => {
      request.cookieAuth.set({userId: 0});
      reply('cookie set');
    },
    config: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/people/add',
    handler: handlers.serveView('add-user')
  },
  {
    method: 'POST',
    path: '/people/add',
    handler: handlers.createNewPrimaryUser,
    config: {
      validate: validate.adminAddUser
    }
  },
  {
    method: 'GET',
    path: '/people/activate/{hashedId}',
    handler: handlers.serveView('activate')
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
    method: 'GET',
    path: '/login',
    handler: handlers.serveView('login'),
    config: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/login',
    handler: handlers.login,
    config: {
      auth: false,
      validate: validate.login
    }
  },
  {
    method: 'GET',
    path: '/orgs/add',
    handler: handlers.serveView('add-organisation')
  },
  {
    method: 'POST',
    path: '/orgs/add',
    handler: handlers.createNewOrganisation,
    config: {
      validate: validate.adminAddOrganisation
    }
  },
  {
    method: 'GET',
    path: '/orgs',
    handler: handlers.viewAllOrganisations
  },
  {
    method: 'GET',
    path: '/orgs/{id}',
    handler: handlers.viewOrganisationDetails
  }
];

module.exports = routes;
