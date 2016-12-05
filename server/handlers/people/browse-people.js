'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var options;
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');

  // get all challenges, associated by a tag, from all active organisations
  request.server.methods.pg.people.getAllPeople(
    permissions.permissions.primary,
    function (pgErr, users) {
      Hoek.assert(!pgErr, 'error getting challenges by tag');
      options = Object.assign(
        {},
        { users: users },
        permissions
      );

      return reply.view('people/view', options);
    });
};
