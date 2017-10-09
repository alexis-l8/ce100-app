var Hoek = require('hoek');
var helpers = require('../helpers.js');
var Boom = require('boom');

module.exports = function (request, reply) {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);
  var topNavBarType = loggedIn.organisation_id === orgId ? 'profile' : 'explorer';
  var result = {};

  // get organisation main details
  request.server.methods.pg.organisations.orgsGetById(orgId, function (error, orgData) {
    result.org = orgData[0];
    // get tags linked to the organisation
    request.server.methods.pg.organisations.orgsGetTags(orgId, function (error, tags) {
      result.org.tags = tags;

      // get challenges of the organisation
      request.server.methods.pg.challenges.getByOrgId(orgId, function (error, challenges) {
        result.challenges = challenges;

        // get all the active user of the organisation
        request.server.methods.pg.people.peopleGetByOrgId(orgId, function (error, people) {
          result.people = people;

          var blockAccess =
            !(loggedIn.scope === 'admin' || loggedIn.scope === 'content-owner')
            && !result.org.org_active;
          // If the organisation is not active, then only an admin and content-owner can view
          if (blockAccess) {
            return reply(Boom.forbidden('You cannot access that organisation'));
          }

          var options = Object.assign(
            {},
            result,
            { view: helpers.getView(request.path) },
            {topNavBarType: topNavBarType},
            permissions
          );

          return reply.view('organisations/details', options);
        })

      })
    });
  });
};
