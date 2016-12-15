'use strict';

var helpers = require('../helpers.js');
var Boom = require('boom');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var options = {};

  if (loggedIn.scope !== 'primary') {
    return reply(Boom.forbidden());
  }

  options = Object.assign({}, permissions, { error: error });

  return reply.view('challenges/add', options).code(error ? 401 : 200);
};
