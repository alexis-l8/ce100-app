'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var options;
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var notAdmin = !permissions.permissions.admin;
  var listUsers;
  var sortBy = request.query.sort;
  var sorting = "A-Z";

  request.server.methods.pg.people.getAllPeople(notAdmin,
    function (pgErr, users) {
      Hoek.assert(!pgErr, 'error getting all users');
      // filter pending users
      if (!permissions.permissions.admin) {
        listUsers = users.filter(function(u) {
          return u.account_activated;
        })
      } else {
        listUsers = users;
      }
      listUsers.sort(function (u1, u2) {
        if (u1.last_name > u2.last_name) return 1;
        if (u1.last_name < u2.last_name) return -1;
        return 0;
      })
      if (sortBy === 'z-a') {
        listUsers.reverse();
        sorting = "Z-A";
      }

      options = Object.assign(
        {},
        { users: listUsers, sortBy: sorting },
        permissions
      );

      return reply.view('people/view', options);
    });
};
