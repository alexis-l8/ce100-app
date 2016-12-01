'use strict';

var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = function () {
  return function (request, reply) {
    var options;
    var loggedIn = request.auth.credentials;
    var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
    // set filter tag, integer if one is given, and `false` if not.
    // var filterTag = (request.query && request.query.tags) || false;

    // get all challenges, associated by a tag, from all active organisations
    request.server.methods.pg.organisations.getActiveOrgs(
      function (pgErr, orgs) {
        Hoek.assert(!pgErr, 'error getting challenges by tag');
        options = Object.assign(
          {},
          // CURRENTLY DATA === RESPONSE i.e. `orgs`
          // NEED TO CHANGE PLUGIN TO ACCOMMODATE FILTERS
          { data: orgs },
          // { filters: challenges.filters },
          permissions
        );
        return reply.view('browse/orgs', options);
        // return reply.view('browse/organisations', options);
      });
  };
};
