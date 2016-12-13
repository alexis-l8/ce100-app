'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var editId = request.params.id && JSON.parse(request.params.id);
  var options, msg;

  if (loggedIn.userId !== editId && loggedIn.scope !== 'admin') {
    msg = 'You do not have the permissions to edit this user\'s settings';

    return reply(Boom.badRequest(msg));
  }

  request.server.methods.pg.people.getBy('id', editId,
    function (pgErr, profile) {
      Hoek.assert(!pgErr, 'database error');
      options = Object.assign(
        permissions,
        { user: profile[0] },
        { error: error }
      );

      return reply.view('people/edit', options).code(error ? 401 : 200);
    });
};
