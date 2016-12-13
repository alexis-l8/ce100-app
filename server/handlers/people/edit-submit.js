'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var updatedProfile = request.payload;
  var options;

  console.log(updatedProfile);
  // request.server.methods.pg.people.getBy('id', loggedIn.userId,
  //   function (pgErr, profile) {
  //     Hoek.assert(!pgErr, 'database error');
  //     options = Object.assign(
  //       { user: profile },
  //       permissions,
  //       { error: error }
  //     );
  //
  //     return reply.view('people/edit', options).code(error ? 401 : 200);
  //   });
};
