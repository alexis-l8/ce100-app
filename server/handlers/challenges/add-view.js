'use strict';

var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var options = Object.assign(permissions, { error: error });

  if (loggedIn.scope !== 'primary') {
    return reply(Boom.forbidden());
  }

  return reply.view('challenges/add', options).code(error ? 401 : 200);
};
