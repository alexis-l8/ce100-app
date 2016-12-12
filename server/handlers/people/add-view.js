'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');

function removeLinked (org) {
  return org.active_primary_user === null;
}

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var unlinkedActiveOrgs, options;

  request.server.methods.pg.organisations.getActive(function (pgErr, orgs) {
    Hoek.assert(!pgErr, 'database error');

    unlinkedActiveOrgs = orgs.filter(removeLinked);
    options = Object.assign({},
      { orgs: unlinkedActiveOrgs },
      helpers.userTypeRadios(),
      permissions,
      { error: error }
    );

    return reply.view('people/add', options).code(error ? 401 : 200);
  });
};
