'use strict';

var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var options = Object.assign(permissions, { error: error });
  var msg;

  if (loggedIn.scope !== 'primary') {
    msg = 'You do not have permission to add a new challenge.';

    return reply(Boom.unauthorized(msg));
  }

  return reply.view('challenges/add', options).code(error ? 401 : 200);
};
