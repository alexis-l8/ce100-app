'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var options;
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var notAdmin = !permissions.permissions.admin;

  request.server.methods.pg.people.getAllPeople(notAdmin,
    function (pgErr, users) {
      Hoek.assert(!pgErr, 'error getting all users');

      options = Object.assign(
        {},
        { users: users },
        permissions
      );

      return reply.view('people/view', options);
    });
};
