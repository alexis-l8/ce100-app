var Hoek = require('hoek');
var Boom = require('boom');

module.exports = function (request, reply) {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin') {
    return reply(Boom.unauthorized('You do not have permission to edit that organisation.'));
  }

  request.server.methods.pg.organisations.edit(orgId, request.payload, function (error, response) {
    Hoek.assert(!error, 'database error');
    return reply.redirect('/orgs/' + orgId + '/tags')
  });
};
