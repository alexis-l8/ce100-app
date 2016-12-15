'use strict';

var Hoek = require('hoek');
var Boom = require('boom');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var editId = request.params.id && JSON.parse(request.params.id);
  var msg;

  if (loggedIn.userId !== editId && loggedIn.scope !== 'admin') {
    msg = 'You do not have the permissions to edit this user\'s settings';

    return reply(Boom.badRequest(msg));
  }

  return request.server.methods.pg.people.edit(editId, request.payload,
    function (pgErr) {
      Hoek.assert(!pgErr, 'database error');

      // if admin, redirect to /people, otherwise redirect to users profile
      return loggedIn.scope === 'admin'
        ? reply.redirect('/people')
        : reply.redirect('/orgs/' + loggedIn.organisation_id)
    });
};