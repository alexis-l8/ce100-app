'use strict';

var Hoek = require('hoek');
var Boom = require('boom');

module.exports = function (request, reply) {
  var uid = request.params.id;
  var loggedIn = request.auth.credentials;
  var message;

  if (loggedIn.scope !== 'admin') {
    message = 'You do not have permission to edit this challenge.';

    return reply(Boom.unauthorized(message));
  }

  return request.server.methods.pg.people.toggleActive(uid,
    function (err, res) {
      Hoek.assert(!err, 'database error');

      return reply.redirect('/people');
    });
};
