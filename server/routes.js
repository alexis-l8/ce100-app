const validate = require('./person.js');
const handlers = require('./handlers.js');

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: handlers.serveView('dashboard')
  },
  {
    method: 'GET',
    path: '/people',
    handler: handlers.viewAllUsers
  },
  {
    method: 'GET',
    path: '/people/add',
    handler: handlers.createNewPrimaryUserForm,
    config: {
      // auth: { scope: 'admin' }
    }
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
      // auth: { scope: 'admin' },
      validate: validate.adminAddUser
    }
  },
  {
    method: 'GET',
    path: '/people/activate/{hashedId}',
    handler: handlers.serveView('activate'),
    config: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/people/activate/{hashedId}',
    handler: handlers.activatePrimaryUser,
    config: {
      validate: validate.confirmPassword,
      auth: false
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
    handler: handlers.serveView('add-organisation'),
    config: {
      // auth: { scope: 'admin' }
    }
  },
  {
    method: 'POST',
    path: '/orgs/add',
    handler: handlers.createNewOrganisation,
    config: {
      // auth: { scope: 'admin' },
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
  },
  {
    method: 'GET',
    path: '/orgs/{id}/edit',
    handler: handlers.editOrganisationDetails
  },
  {
    method: 'GET',
    path: '/{path*}',
    handler: handlers.serveFile
  }
];

module.exports = routes;
