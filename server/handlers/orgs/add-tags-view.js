var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var orgId = request.params.id;
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);
  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin') {
    return reply(Boom.unauthorized('You do not have permission to edit that organisation.'));
  }


  request.server.methods.pg.tags.getTagsForEdit('organisations', orgId, function (pgErr, tags) {
    Hoek.assert(!pgErr, 'Database Error');
    var options = Object.assign({tags}, permissions);

    return reply.view('tags', options);

  });
};
