const validate = require('./joi.js');
const handlers = require('./handlers.js');

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: handlers.checkUser // replace with handlers.serveSpecificFile('dashboard')
  },
  {
    method: 'GET',
    path: '/people',
    handler: handlers.viewAllUsers
  },
  {
    method: 'GET',
    path: '/people/{id}',
    handler: handlers.viewUserDetails
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
    path: '/people/add',
    handler: handlers.serveSpecificFile('add-user')
  },
  {
    method: 'GET',
    path: '/people/activate/{hashedId}',
    handler: handlers.serveSpecificFile('activate')
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
    path: '/orgs/add',
    handler: handlers.serveSpecificFile('add-organisation')
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
  }
];

module.exports = routes;
