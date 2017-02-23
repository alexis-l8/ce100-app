var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);
  var error = helpers.errorOptions(joiErr);
  var template;

  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin' || loggedIn.scope === 'secondary') {
    return reply(Boom.forbidden('You do not have permission to edit that organisation.'));
  }

  request.server.methods.pg.organisations.getDetails(orgId, function (pgError, orgData) {
    var options = Object.assign({}, orgData, permissions, {error});

    Hoek.assert(!pgError, 'db error');

    template = 'organisations/edit-' + loggedIn.scope;
    console.log(template);
    return reply.view(template, options).code(error ? 401 : 200);
  });
};
