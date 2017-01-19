var Hoek = require('hoek');
var helpers = require('../helpers.js');
var Boom = require('boom');

module.exports = function (request, reply) {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);

  if (loggedIn.organisation_id !== orgId) {
    return reply(Boom.forbidden());
  }

  request.server.methods.pg.challenges.getArchived(orgId, function (error, challenges) {
    Hoek.assert(!error, 'Error retrieving organisation with id ' + orgId)
    var options = Object.assign(
      {},
      { challenges: challenges },
      permissions
    );
    return reply.view('organisations/archived-challenges', options);
  });
};
