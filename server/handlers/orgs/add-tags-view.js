var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var msg;

  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin' || loggedIn.scope === 'secondary') {
    msg = 'You do not have permission to edit that organisation.';

    return reply(Boom.unauthorized(msg));
  }

  return request.server.methods.pg.tags.getTagsForEdit('organisations', orgId,
    function (pgErr, tags) {
      var permissions = helpers.getPermissions(loggedIn, 'organisation_id',
        orgId);
      var options = Object.assign(
        permissions,
        { tags: helpers.locationCategoryToEnd(tags) },
        { error: error }
      );

      Hoek.assert(!pgErr, 'Database Error');

      return reply.view('tags', options).code(error ? 400 : 200);
    });
};
