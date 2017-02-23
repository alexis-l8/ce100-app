'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var options;
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');

  request.server.methods.pg.insights.getResources(
    !permissions.permissions.admin, function (pgErr, pgRes) {
      Hoek.assert(!pgErr, 'error getting all resources' + pgErr);
      options = Object.assign(
        { resources: pgRes },
        permissions
      );

      return reply.view('insights/resources', options);
    });
};
