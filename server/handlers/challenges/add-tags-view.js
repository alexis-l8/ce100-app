'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var cid = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var options, msg;

  if (loggedIn.scope !== 'primary') {
    msg = 'You do not have permission to add a new challenge.';

    return reply(Boom.unauthorized(msg));
  }

  return request.server.methods.pg.tags.getTagsForEdit('challenges', cid,
    function (pgErr, tags) {
      Hoek.assert(!pgErr, 'Database Error');
      options = Object.assign(
        { view: helpers.getView(request.path) },
        permissions,
        { tags: tags },
        { error: error }
       );

      return reply.view('tags', options).code(error ? 400 : 200);
    });
};
