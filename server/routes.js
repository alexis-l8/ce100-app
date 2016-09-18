var validatePerson = require('./person.js');
var validateOrg = require('./organisation.js');
var handlers = require('./handlers.js');

var routes = [
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
      auth: { scope: 'admin' }
    }
  },
  {
    method: 'POST',
    path: '/people/add',
    handler: handlers.createNewPrimaryUser,
    config: {
      auth: { scope: 'admin' },
      validate: validatePerson.adminAddUser
    }
  },
  // {
  //   method: 'GET',
  //   path: '/people/{id}',
  //   handler: handlers.viewUserDetails
  // },
  {
    method: 'GET',
    path: '/people/{id}/edit',
    handler: handlers.editUserView
  },
  {
    method: 'POST',
    path: '/people/{id}/edit',
    handler: handlers.editUserSubmit,
    config: {
      validate: validatePerson.editUser
    }
  },
  {
    method: 'GET',
    path: '/people/{id}/toggle-archive',
    handler: handlers.toggleArchiveUser
  },
  {
    method: 'GET',
    path: '/people/activate/{hashedId}',
    handler: handlers.activateAccountView,
    config: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/people/activate/{hashedId}',
    handler: handlers.activatePrimaryUser,
    config: {
      validate: validatePerson.confirmPassword,
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
      validate: validatePerson.login
    }
  },
  {
    method: 'GET',
    path: '/logout',
    handler: handlers.logout
  },
  {
    method: 'GET',
    path: '/orgs/add',
    handler: handlers.serveView('add-organisation'),
    config: {
      auth: { scope: 'admin' }
    }
  },
  {
    method: 'POST',
    path: '/orgs/add',
    handler: handlers.createNewOrganisation,
    config: {
      auth: { scope: 'admin' },
      validate: validatePerson.adminAddOrganisation
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
    handler: require('./handlers/view-org-details.js')
  },
  {
    method: 'GET',
    path: '/orgs/{id}/edit',
    handler: handlers.editOrganisationDetails
  },
  {
    method: 'POST',
    path: '/orgs/{id}/edit',
    handler: handlers.submitEditOrg,
    config: {
      validate: validateOrg.adminEditOrg
    }
  },
  {
    method: 'GET',
    path: '/orgs/{id}/toggle-archive',
    handler: handlers.toggleArchiveOrg
  },
  {
    method: 'GET',
    path: '/tags',
    handler: require('./handlers/view-all-tags.js')
  },
  {
    method: 'POST',
    path: '/tags',
    handler: require('./handlers/select-tags.js')
  },
  {
    method: 'GET',
    path: '/challenges/add',
    handler: handlers.serveView('challenges/add')
  },
  {
    method: 'POST',
    path: '/challenges/add',
    handler: require('./handlers/add-new-challenge.js'),
    config: {
      validate: require('./models/add-new-challenge.js')
    }
  },
  {
    method: 'GET',
    path: '/{path*}',
    handler: handlers.serveFile,
    config: {
      auth: false
    }
  }
];

module.exports = routes;
