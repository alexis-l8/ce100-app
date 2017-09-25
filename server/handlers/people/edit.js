'use strict';

var Hoek = require('hoek');
var Boom = require('boom');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var editId = request.params.id && JSON.parse(request.params.id);
  var payload = request.payload;
  payload.email = payload.email.toLowerCase();

  if (parseInt(loggedIn.userId, 10) !== editId && (loggedIn.scope !== 'admin' && loggedIn.scope !== 'content-owner')) {
    return reply(Boom.forbidden());
  }
  return request.server.methods.pg.people.edit(editId, payload,
    function (pgErr) {
      Hoek.assert(!pgErr, 'database error');

      // if admin, redirect to /people, otherwise redirect to users profile
      return (loggedIn.scope === 'admin' || loggedIn.scope === 'content-owner' )
        ? reply.redirect('/people')
        : reply.redirect('/orgs/' + loggedIn.organisation_id)
    });
};
