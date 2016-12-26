'use strict';

var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var doctype = [
    { id: '1', name: '.pdf' },
    { id: '2', name: '.jpeg' },
    { id: '3', name: '.txt' },
    { id: '4', name: '.html' }
  ];
  var options = Object.assign(
    { doctype: doctype },
    permissions,
    { error: error }
  );

  if (loggedIn.scope !== 'admin') {
    return reply(Boom.forbidden());
  }

  return reply.view('insights/add', options).code(error ? 401 : 200);
};
