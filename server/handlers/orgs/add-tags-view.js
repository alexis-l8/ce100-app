var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var msg, permissions, views, options;

  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin'
      || loggedIn.scope === 'secondary') {
    msg = 'You do not have permission to edit that organisation.';

    return reply(Boom.unauthorized(msg));
  }

  return request.server.methods.pg.tags.getTagsForEdit('organisations', orgId,
    function (pgErr, tags) {
      permissions = helpers.getPermissions(loggedIn, 'organisation_id',
        orgId);
      views = {
        referer: '/orgs/' + orgId + '/edit',
        cancel: '/orgs'
      };
      options = Object.assign(
        permissions,
        { views: views },
        { tags: helpers.locationCategoryToEnd(tags) },
        { error: error }
      );

      Hoek.assert(!pgErr, 'Database Error');

      return reply.view('tags', options).code(error ? 400 : 200);
    });
};
