'use strict';

var Hoek = require('hoek');
var Boom = require('boom');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var iid = request.params.id;

  if (loggedIn.scope !== 'admin' && loggedIn.scope !== 'content-owner') {
    return reply(Boom.forbidden());
  }

  return request.server.methods.pg.insights.toggleActive(iid,
    function (err) {
      Hoek.assert(!err, 'database error');

      return reply.redirect('/insights');
    });
};
