'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var options;
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  // set filter tag, integer if one is given, and `false` if not.
  var filterTag = (request.query && request.query.tags) || false;

  // get all challenges, associated by a tag, from all active organisations
  request.server.methods.pg.organisations.orgsGetByTag(
    !permissions.permissions.admin, filterTag,
    function (pgErr, data) {
      Hoek.assert(!pgErr, 'error getting challenges by tag');
      options = Object.assign(
        { data: data.orgs },
        { filter: helpers.browseViewTabBar('orgs', data.filter) },
        { view: helpers.getView(request.path) },
        permissions
      );

      return reply.view('organisations/browse', options);
    });
};
