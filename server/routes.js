var routes = [

  /*  ---  GENERAL ROUTES  ---  */
  {
    method: 'GET',
    path: '/',
    handler: require('./handlers/serve-view.js')('dashboard')
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
      validate: require('./models/edit-user')
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
    handler: require('./handlers/serve-view.js')('add-organisation'),
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
    path: '/orgs',
    handler: require('./handlers/all-orgs-view.js')
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
    path: '/challenges/add',
    handler: require('./handlers/serve-view.js')('challenges/add'),
  },
  {
    method: 'POST',
    path: '/challenges/add',
    handler: require('./handlers/add-new-challenge.js'),
    config: {
      validate: require('./models/add-new-challenge.js')
    }
  }
];

module.exports = routes;
