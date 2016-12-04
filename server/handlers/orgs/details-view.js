var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);
  request.server.methods.pg.organisations.getDetails(orgId, function (error, orgData) {
    Hoek.assert(!error, 'Error retrieving organisation with id ' + orgId)

    // If the organisation is not active, then only an admin can view
    if (loggedIn.scope !== 'admin' && !orgData.org.active) {
      return reply(Boom.notFound('That organisation does not exist'));
    }

    var options = Object.assign({}, orgData, permissions);
    return reply.view('organisations/details', options);
  });
};
