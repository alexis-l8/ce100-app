var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);
  var error = helpers.errorOptions(joiErr);
  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin') {
    return reply(Boom.unauthorized('You do not have permission to edit that organisation.'));
  }

  request.server.methods.pg.organisations.getDetails(orgId, function (pgErr, orgData) {
    var options = Object.assign({}, orgData, permissions, {error});

    Hoek.assert(!pgErr, 'database error');

    return reply.view('organisations/edit', options).code(error ? 401 : 200);
  });
};
