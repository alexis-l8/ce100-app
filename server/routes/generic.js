module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => reply.redirect('/orgs')
  },
  {
    method: 'GET',
    path: '/{path*}',
    handler: require('../handlers/serve-file.js'),
    config: {
      auth: false
    }
  }
];
