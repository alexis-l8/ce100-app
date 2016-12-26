'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var options;
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  // set filter tag, integer if one is given, and `false` if not.
  var filterTag = (request.query && request.query.tags) || false;

  request.server.methods.pg.insights.getAll(!permissions.permissions.admin,
    function (pgErr, pgRes) {
      Hoek.assert(!pgErr, 'error getting insights by tag' + pgErr);
      options = Object.assign(
        { insights: pgRes.insights },
        { filter: pgRes.filter },
        permissions
      );

      return reply.view('insights/browse', options);
    });
};
