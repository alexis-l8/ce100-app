'use strict';

var Hoek = require('hoek');
var Boom = require('boom');

module.exports = function (request, reply) {
  // var uid = request.params.id;
  // var loggedIn = request.auth.credentials;
  // var toggleActive = request.server.methods.pg.people.toggleActive;
  // var message;
  //
  // if (loggedIn.scope !== 'admin') {
  //   message = 'You do not have permission to edit the people.';
  //
  //   return reply(Boom.unauthorized(message));
  // }
  //
  // return toggleActive(uid, function (err) {
  //   Hoek.assert(!err, 'database error');
  //
  //   return reply.redirect('/people');
  // });
  return reply('resend activation link!')
};
