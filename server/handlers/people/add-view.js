'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');
var Boom = require('boom');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var getActiveOrgs = request.server.methods.pg.organisations.getActive;
  var options;

  return getActiveOrgs(function (pgErr, orgs) {
    Hoek.assert(!pgErr, 'database error');

    options = Object.assign({},
      { orgs: orgs },
      helpers.userTypeRadios(),
      permissions,
      { error: error }
    );

    return reply.view('people/add', options).code(error ? 401 : 200);
  });
};
