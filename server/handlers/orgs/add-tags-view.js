var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;

  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin') {
    return reply(Boom.unauthorized('You do not have permission to edit that organisation.'));
  }


  request.server.methods.pg.tags.getTagsForEdit('organisations', orgId, function (pgErr, tags) {
    var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);
    var options = Object.assign({tags}, permissions);
    Hoek.assert(!pgErr, 'Database Error');

    return reply.view('tags', options);

  });
};
