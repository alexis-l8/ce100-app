var routes = [

  /*  ---  GENERAL ROUTES  ---  */
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => reply.redirect('/browse/orgs')
  },
  {
    method: 'GET',
    path: '/{path*}',
    handler: require('./handlers/serve-file.js'),
    config: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/login',
    handler: require('./handlers/serve-view.js')('login'),
    config: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/login',
    handler: require('./handlers/login.js'),
    config: {
      auth: false,
      validate: require('./models/login.js')
    }
  },
  {
    method: 'GET',
    path: '/logout',
    handler: require('./handlers/logout.js')
  },

  /*  ---  /people ROUTES  ---  */
  {
    method: 'GET',
    path: '/people',
    handler: require('./handlers/all-users-view.js')
  },
  {
    method: 'GET',
    path: '/people/add',
    handler: require('./handlers/create-user-view.js'),
    config: {
      auth: { scope: 'admin' }
    }
  },
  {
    method: 'POST',
    path: '/people/add',
    handler: require('./handlers/create-new-user.js'),
    config: {
      auth: { scope: 'admin' },
      validate: require('./models/admin-add-user.js')
    }
  },
  // {
  //   method: 'GET',
  //   path: '/people/{id}',
  //   handler: require('./handlers/user-details-view.js')
  // },
  {
    method: 'GET',
    path: '/people/{id}/edit',
    handler: require('./handlers/edit-user-view.js')
  },
  {
    method: 'POST',
    path: '/people/{id}/edit',
    handler: require('./handlers/edit-user.js'),
    config: {
      validate: require('./models/edit-user.js')
    }
  },
  {
    method: 'GET',
    path: '/people/{id}/toggle-archive',
    handler: require('./handlers/toggle-archive-user.js')
  },
  {
    method: 'GET',
    path: '/people/activate/{hashedId}',
    handler: require('./handlers/activate-account-view.js'),
    config: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/people/activate/{hashedId}',
    handler: require('./handlers/activate-user-account.js'),
    config: {
      validate: require('./models/confirm-password.js'),
      auth: false
    }
  },

    /*  ---  /orgs ROUTES  ---  */
  {
    method: 'GET',
    path: '/orgs/add',
    handler: require('./handlers/serve-view.js')('organisations/add'),
    config: {
      auth: { scope: 'admin' }
    }
  },
  {
    method: 'POST',
    path: '/orgs/add',
    handler: require('./handlers/create-new-org.js'),
    config: {
      auth: { scope: 'admin' },
      validate: require('./models/admin-add-org.js')
    }
  },
  {
    method: 'GET',
    path: '/orgs/{id}',
    handler: require('./handlers/org-details-view.js')
  },
  {
    method: 'GET',
    path: '/orgs/{id}/edit',
    handler: require('./handlers/edit-org-view.js')
  },
  {
    method: 'POST',
    path: '/orgs/{id}/edit',
    handler: require('./handlers/edit-org.js'),
    config: {
      validate: require('./models/admin-edit-org.js')
    }
  },
  {
    method: 'GET',
    path: '/orgs/{id}/toggle-archive',
    handler: require('./handlers/toggle-archive-org.js')
  },
  {
    method: 'GET',
    path: '/orgs/{id}/tags',
    handler: require('./handlers/org-select-tags-view.js')
  },
  {
    method: 'POST',
    path: '/orgs/{id}/tags',
    handler: require('./handlers/org-select-tags.js')
  },

  /*  ---  CHALLENGE ROUTES  ---  */
  {
    method: 'GET',
    path: '/challenges/{challengeId}/tags',
    handler: require('./handlers/select-tags-view.js')
  },
  {
    method: 'POST',
    path: '/challenges/{challengeId}/tags',
    handler: require('./handlers/select-tags.js'),
    config: {
      validate: require('./models/max-allowed-tags.js'),
    }
  },
  {
    method: 'GET',
    path: '/challenges/add',
    handler: require('./handlers/add-challenge-view.js')
  },
  {
    method: 'POST',
    path: '/challenges/add',
    handler: require('./handlers/add-challenge.js'),
    config: {
      validate: require('./models/add-challenge.js'),
      auth: { scope: 'primary' }
    }
  },
  {
    method: 'GET',
    path: '/challenges/{id}/edit',
    handler: require('./handlers/edit-challenge-view.js')
  },
  {
    method: 'POST',
    path: '/challenges/{id}/edit',
    handler: require('./handlers/edit-challenge.js'),
    config: {
      validate: require('./models/edit-challenge.js'),
    }
  },
  {
    method: 'GET',
    path: '/challenges/{id}/toggle-archive',
    handler: require('./handlers/toggle-archive-challenge.js')
  },
  /*  ---  BROWSE ROUTES  ---  */
  // TODO: ADD VALIDATION TO QUERY PARAMS & REACT TO NON EXISTING TAG
  {
    method: 'GET',
    path: '/browse/{view}/tags',
    handler: require('./handlers/browse-add-tags-view.js')
  },
  {
    method: 'GET',
    path: '/browse/{view}',
    handler: require('./handlers/browse-view.js')
  }
];

module.exports = routes;
