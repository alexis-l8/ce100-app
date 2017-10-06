var Hoek = require('hoek');
var helpers = require('../helpers.js');
var Boom = require('boom');

module.exports = function (request, reply) {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);
  var topNavBarType = loggedIn.organisation_id === orgId ? 'profile' : 'explorer';

  request.server.methods.pg.organisations.getDetails(orgId, function (error, orgData) {
    Hoek.assert(!error, 'Error retrieving organisation with id ' + orgId)
    var blockAccess =
      !(loggedIn.scope === 'admin' || loggedIn.scope === 'content-owner')
      && !orgData.org.active;
    // If the organisation is not active, then only an admin and content-owner can view
    if (blockAccess) {
      return reply(Boom.forbidden('You cannot access that organisation'));
    }

    var options = Object.assign(
      {},
      orgData,
      { view: helpers.getView(request.path) },
      {topNavBarType: topNavBarType},
      permissions
    );

    return reply.view('organisations/details', options);
  });
};
