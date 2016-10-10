var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var permissions = helpers.getPermissions(request.auth.credentials, 'scope', 'admin');
  request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
    Hoek.assert(!error, 'redis error');
    var organisations = {
      allOrganisations: stringifiedOrgs.map(element => JSON.parse(element)),
      alternate: [{
        path: '/orgs/add',
        name: '+'
      }, {
        path: '/people',
        name: 'People'
      }]
    };
    var options = Object.assign({}, organisations, permissions);
    reply.view('browse/browse', options);
  });
};
